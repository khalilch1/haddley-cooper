const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { adminOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET all products (public)
router.get('/', optionalAuth, (req, res) => {
  const { category, search, featured, new: isNew, page = 1, limit = 12, sort = 'created_at' } = req.query;
  let query = `SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1`;
  const params = [];

  if (category) { query += ` AND c.slug = ?`; params.push(category); }
  if (search) { query += ` AND (p.name LIKE ? OR p.description LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  if (featured === 'true') { query += ` AND p.is_featured = 1`; }
  if (isNew === 'true') { query += ` AND p.is_new = 1`; }

  const sortMap = { price_asc: 'p.price ASC', price_desc: 'p.price DESC', name: 'p.name ASC', created_at: 'p.created_at DESC' };
  query += ` ORDER BY ${sortMap[sort] || 'p.created_at DESC'}`;

  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

  const products = db.prepare(query).all(...params).map(p => ({
    ...p,
    images: JSON.parse(p.images || '[]'),
    tags: JSON.parse(p.tags || '[]'),
    price: req.user?.is_pro && p.pro_price ? p.pro_price : p.price
  }));

  res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

// GET single product
router.get('/:slug', optionalAuth, (req, res) => {
  const product = db.prepare(`SELECT p.*, c.name as category_name, c.slug as category_slug FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ? AND p.is_active = 1`).get(req.params.slug);
  if (!product) return res.status(404).json({ error: 'Produit non trouvé' });
  const reviews = db.prepare(`SELECT r.*, u.first_name, u.last_name FROM reviews r LEFT JOIN users u ON r.user_id = u.id WHERE r.product_id = ? AND r.is_approved = 1 ORDER BY r.created_at DESC`).all(product.id);
  res.json({
    ...product,
    images: JSON.parse(product.images || '[]'),
    tags: JSON.parse(product.tags || '[]'),
    price: req.user?.is_pro && product.pro_price ? product.pro_price : product.price,
    reviews,
    avg_rating: reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
  });
});

// ADMIN: Create product
router.post('/', adminOnly, (req, res) => {
  const { name, slug, description, short_description, price, pro_price, compare_price, stock, sku, brand, unit, category_id, is_featured, is_new, images, tags } = req.body;
  const id = uuidv4();
  db.prepare(`INSERT INTO products (id, name, slug, description, short_description, price, pro_price, compare_price, stock, sku, brand, unit, category_id, is_featured, is_new, images, tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(id, name, slug, description, short_description, price, pro_price || null, compare_price || null, stock || 0, sku || null, brand || null, unit || 'unité', category_id || null, is_featured ? 1 : 0, is_new ? 1 : 0, JSON.stringify(images || []), JSON.stringify(tags || []));
  res.json({ id, success: true });
});

// ADMIN: Update product
router.put('/:id', adminOnly, (req, res) => {
  const { name, slug, description, short_description, price, pro_price, compare_price, stock, sku, brand, unit, category_id, is_featured, is_new, is_active, images, tags } = req.body;
  db.prepare(`UPDATE products SET name=?, slug=?, description=?, short_description=?, price=?, pro_price=?, compare_price=?, stock=?, sku=?, brand=?, unit=?, category_id=?, is_featured=?, is_new=?, is_active=?, images=?, tags=?, updated_at=datetime('now') WHERE id=?`)
    .run(name, slug, description, short_description, price, pro_price || null, compare_price || null, stock, sku, brand, unit, category_id, is_featured ? 1 : 0, is_new ? 1 : 0, is_active ? 1 : 0, JSON.stringify(images || []), JSON.stringify(tags || []), req.params.id);
  res.json({ success: true });
});

// ADMIN: Delete product
router.delete('/:id', adminOnly, (req, res) => {
  db.prepare('UPDATE products SET is_active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ADMIN: Get all including inactive
router.get('/admin/all', adminOnly, (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  let query = `SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
  const params = [];
  if (search) { query += ` AND (p.name LIKE ? OR p.sku LIKE ?)`; params.push(`%${search}%`, `%${search}%`); }
  const total = db.prepare(`SELECT COUNT(*) as count FROM (${query})`).get(...params).count;
  query += ` ORDER BY p.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
  const products = db.prepare(query).all(...params).map(p => ({ ...p, images: JSON.parse(p.images || '[]'), tags: JSON.parse(p.tags || '[]') }));
  res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

module.exports = router;
