const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../models/db');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { email, password, first_name, last_name, phone, is_pro } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
  const hashed = bcrypt.hashSync(password, 10);
  const id = uuidv4();
  db.prepare('INSERT INTO users (id, email, password, first_name, last_name, phone, is_pro) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(id, email, hashed, first_name || '', last_name || '', phone || '', is_pro ? 1 : 0);
  const token = jwt.sign({ id, email, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, email, first_name, last_name, role: 'customer', is_pro: is_pro ? 1 : 0 } });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password))
    return res.status(401).json({ error: 'Identifiants invalides' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, first_name, last_name, phone, role, is_pro, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json(user);
});

router.put('/me', auth, (req, res) => {
  const { first_name, last_name, phone } = req.body;
  db.prepare('UPDATE users SET first_name=?, last_name=?, phone=?, updated_at=datetime("now") WHERE id=?')
    .run(first_name, last_name, phone, req.user.id);
  res.json({ success: true });
});

router.put('/me/password', auth, (req, res) => {
  const { current_password, new_password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!bcrypt.compareSync(current_password, user.password))
    return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
  const hashed = bcrypt.hashSync(new_password, 10);
  db.prepare('UPDATE users SET password=? WHERE id=?').run(hashed, req.user.id);
  res.json({ success: true });
});

module.exports = router;
