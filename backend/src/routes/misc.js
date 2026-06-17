const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { adminOnly } = require('../middleware/auth');

const categoriesRouter = express.Router();

categoriesRouter.get('/', (req, res) => {
  const cats = db.prepare(`SELECT c.*, COUNT(p.id) as product_count FROM categories c LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1 GROUP BY c.id ORDER BY c.sort_order, c.name`).all();
  res.json(cats);
});

categoriesRouter.post('/', adminOnly, (req, res) => {
  const { name, slug, description, image_url, parent_id, sort_order } = req.body;
  const id = uuidv4();
  db.prepare('INSERT INTO categories (id, name, slug, description, image_url, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, name, slug, description || null, image_url || null, parent_id || null, sort_order || 0);
  res.json({ id, success: true });
});

categoriesRouter.put('/:id', adminOnly, (req, res) => {
  const { name, slug, description, image_url, sort_order } = req.body;
  db.prepare('UPDATE categories SET name=?, slug=?, description=?, image_url=?, sort_order=? WHERE id=?').run(name, slug, description, image_url, sort_order || 0, req.params.id);
  res.json({ success: true });
});

categoriesRouter.delete('/:id', adminOnly, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Stats router
const statsRouter = express.Router();

statsRouter.get('/dashboard', adminOnly, (req, res) => {
  const totalRevenue = db.prepare(`SELECT COALESCE(SUM(total), 0) as value FROM orders WHERE payment_status = 'paid'`).get().value;
  const totalOrders = db.prepare(`SELECT COUNT(*) as value FROM orders`).get().value;
  const totalCustomers = db.prepare(`SELECT COUNT(*) as value FROM users WHERE role = 'customer'`).get().value;
  const totalProducts = db.prepare(`SELECT COUNT(*) as value FROM products WHERE is_active = 1`).get().value;
  const pendingOrders = db.prepare(`SELECT COUNT(*) as value FROM orders WHERE status = 'pending'`).get().value;
  const lowStock = db.prepare(`SELECT COUNT(*) as value FROM products WHERE stock <= 10 AND is_active = 1`).get().value;

  const revenueByMonth = db.prepare(`
    SELECT strftime('%Y-%m', created_at) as month, SUM(total) as revenue, COUNT(*) as orders
    FROM orders WHERE payment_status = 'paid' AND created_at >= date('now', '-6 months')
    GROUP BY month ORDER BY month
  `).all();

  const topProducts = db.prepare(`
    SELECT p.name, SUM(oi.quantity) as sold, SUM(oi.subtotal) as revenue
    FROM order_items oi JOIN products p ON oi.product_id = p.id
    GROUP BY oi.product_id ORDER BY sold DESC LIMIT 5
  `).all();

  const ordersByStatus = db.prepare(`SELECT status, COUNT(*) as count FROM orders GROUP BY status`).all();
  const recentOrders = db.prepare(`
    SELECT o.*, u.email as user_email FROM orders o LEFT JOIN users u ON o.user_id = u.id
    ORDER BY o.created_at DESC LIMIT 5
  `).all();

  res.json({ totalRevenue, totalOrders, totalCustomers, totalProducts, pendingOrders, lowStock, revenueByMonth, topProducts, ordersByStatus, recentOrders });
});

// Customers router
const customersRouter = express.Router();

customersRouter.get('/', adminOnly, (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  let query = `SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.is_pro, u.created_at, COUNT(o.id) as order_count, COALESCE(SUM(o.total), 0) as total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.role = 'customer'`;
  const params = [];
  if (search) { query += ` AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)`; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  query += ` GROUP BY u.id`;
  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
  res.json({ customers: db.prepare(query).all(...params), total, page: parseInt(page) });
});

customersRouter.get('/:id', adminOnly, (req, res) => {
  const user = db.prepare('SELECT id, email, first_name, last_name, phone, role, is_pro, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Client non trouvé' });
  const orders = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.params.id);
  res.json({ ...user, orders });
});

customersRouter.put('/:id', adminOnly, (req, res) => {
  const { is_pro, role } = req.body;
  db.prepare('UPDATE users SET is_pro=?, role=? WHERE id=?').run(is_pro ? 1 : 0, role || 'customer', req.params.id);
  res.json({ success: true });
});

module.exports = { categoriesRouter, statsRouter, customersRouter };
