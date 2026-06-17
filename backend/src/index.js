require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Webhook route BEFORE body parser (needs raw body)
const ordersRouter = require('./routes/orders');
app.post('/api/orders/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  ordersRouter.handle(req, res);
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Auto-seed on startup if DB is empty (required for Render ephemeral filesystem)
try {
  const db = require('./models/db');
  const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
  if (count === 0) {
    console.log('📦 DB vide détectée — initialisation du catalogue...');
    require('./seed');
    console.log('✅ Catalogue initialisé avec succès');
  } else {
    console.log(`✅ DB existante — ${count} produits chargés`);
  }
} catch (e) {
  console.error('❌ Erreur auto-seed:', e.message);
}

// Routes
const { categoriesRouter, statsRouter, customersRouter } = require('./routes/misc');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', ordersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/stats', statsRouter);
app.use('/api/customers', customersRouter);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`🚀 Haddley & Cooper API running on http://localhost:${PORT}`);
});
