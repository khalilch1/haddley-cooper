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

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow no-origin requests (mobile, curl, Render health checks)
    if (!origin) return cb(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
  // Auto-seed if DB is empty (Render ephemeral filesystem)
  try {
    const db = require('./models/db');
    const count = db.prepare('SELECT COUNT(*) as c FROM products').get().c;
    if (count === 0) {
      console.log('📦 Empty DB detected — running seed...');
      require('./seed');
    }
  } catch (e) {
    console.error('Auto-seed error:', e.message);
  }
});
