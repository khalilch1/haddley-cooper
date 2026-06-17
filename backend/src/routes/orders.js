const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', optionalAuth, (req, res) => {
  const { items, shipping_address, billing_address, guest_email, notes, coupon_code } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'Panier vide' });

  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = db.prepare('SELECT * FROM products WHERE id = ? AND is_active = 1').get(item.product_id);
    if (!product) return res.status(400).json({ error: `Produit ${item.product_id} non trouvé` });
    if (product.stock < item.quantity) return res.status(400).json({ error: `Stock insuffisant pour ${product.name}` });
    const price = req.user?.is_pro && product.pro_price ? product.pro_price : product.price;
    const itemSubtotal = price * item.quantity;
    subtotal += itemSubtotal;
    orderItems.push({ id: uuidv4(), product_id: product.id, product_name: product.name, product_price: price, quantity: item.quantity, subtotal: itemSubtotal });
  }

  let discount = 0;
  if (coupon_code) {
    const coupon = db.prepare('SELECT * FROM coupons WHERE code = ? AND is_active = 1').get(coupon_code);
    if (coupon && (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) && (!coupon.max_uses || coupon.used_count < coupon.max_uses) && subtotal >= coupon.min_amount) {
      discount = coupon.type === 'percent' ? subtotal * (coupon.value / 100) : coupon.value;
      db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?').run(coupon.id);
    }
  }

  const shipping_cost = subtotal >= 59 ? 0 : 4.90;
  const total = Math.max(0, subtotal - discount + shipping_cost);
  const orderId = uuidv4();
  const orderNumber = `HC-${new Date().getFullYear()}-${String(db.prepare('SELECT COUNT(*) as c FROM orders').get().c + 1).padStart(4, '0')}`;

  db.prepare(`INSERT INTO orders (id, order_number, user_id, guest_email, subtotal, shipping_cost, discount, total, shipping_address, billing_address, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(orderId, orderNumber, req.user?.id || null, guest_email || null, subtotal, shipping_cost, discount, total,
      JSON.stringify(shipping_address), JSON.stringify(billing_address || shipping_address), notes || null);

  const itemStmt = db.prepare('INSERT INTO order_items (id, order_id, product_id, product_name, product_price, quantity, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?)');
  orderItems.forEach(item => {
    itemStmt.run(item.id, orderId, item.product_id, item.product_name, item.product_price, item.quantity, item.subtotal);
    db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?').run(item.quantity, item.product_id);
  });

  res.json({ order_id: orderId, order_number: orderNumber, total, shipping_cost, discount });
});

// Create Stripe payment intent
router.post('/:id/payment-intent', optionalAuth, async (req, res) => {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey || stripeKey.includes('YOUR_STRIPE')) {
      return res.status(503).json({ error: 'Paiement Stripe non configuré. Ajoutez votre clé STRIPE_SECRET_KEY dans le fichier .env' });
    }
    const stripe = require('stripe')(stripeKey);
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ error: 'Commande non trouvée' });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100),
      currency: 'eur',
      metadata: { order_id: order.id, order_number: order.order_number }
    });

    db.prepare('UPDATE orders SET stripe_payment_intent = ? WHERE id = ?').run(paymentIntent.id, order.id);
    res.json({ client_secret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe error:', err.message);
    res.status(500).json({ error: 'Erreur lors de la création du paiement : ' + err.message });
  }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object;
    db.prepare('UPDATE orders SET payment_status = "paid", status = "processing", updated_at = datetime("now") WHERE stripe_payment_intent = ?').run(pi.id);
  }
  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object;
    db.prepare('UPDATE orders SET payment_status = "failed", updated_at = datetime("now") WHERE stripe_payment_intent = ?').run(pi.id);
  }
  res.json({ received: true });
});

// Get user orders
router.get('/my', auth, (req, res) => {
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  const result = orders.map(o => ({
    ...o,
    shipping_address: JSON.parse(o.shipping_address || '{}'),
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)
  }));
  res.json(result);
});

// Get single order
router.get('/:id', optionalAuth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.status(404).json({ error: 'Commande non trouvée' });
  // Autoriser : admin, propriétaire de la commande, ou commande invité (user_id null)
  if (req.user?.role !== 'admin' && order.user_id !== null && order.user_id !== req.user?.id) return res.status(403).json({ error: 'Accès refusé' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ ...order, shipping_address: JSON.parse(order.shipping_address || '{}'), billing_address: JSON.parse(order.billing_address || '{}'), items });
});

// ADMIN: All orders
router.get('/admin/all', adminOnly, (req, res) => {
  const { status, page = 1, limit = 20, search } = req.query;
  let query = `SELECT o.*, u.email as user_email, u.first_name, u.last_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1`;
  const params = [];
  if (status) { query += ` AND o.status = ?`; params.push(status); }
  if (search) { query += ` AND (o.order_number LIKE ? OR u.email LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
  const orders = db.prepare(query).all(...params).map(o => ({
    ...o, shipping_address: JSON.parse(o.shipping_address || '{}'),
    items: db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id)
  }));
  res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// ADMIN: Update order status
router.put('/admin/:id/status', adminOnly, (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
  db.prepare(`UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json({ success: true });
});

module.exports = router;
