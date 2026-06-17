const { Database: WasmDB } = require('node-sqlite3-wasm');
const path = require('path');

// Compatibility wrapper: mimics better-sqlite3 API using node-sqlite3-wasm (no native compilation needed)
class StatementWrapper {
  constructor(db, sql) {
    this._db = db;
    this._sql = sql;
  }
  run(...args) {
    if (args.length === 0) return this._db.run(this._sql);
    const params = args.length === 1 ? args[0] : args;
    return this._db.run(this._sql, params);
  }
  get(...args) {
    if (args.length === 0) return this._db.get(this._sql);
    const params = args.length === 1 ? args[0] : args;
    return this._db.get(this._sql, params);
  }
  all(...args) {
    if (args.length === 0) return this._db.all(this._sql);
    const params = args.length === 1 ? args[0] : args;
    return this._db.all(this._sql, params);
  }
}

class DatabaseWrapper {
  constructor(filePath) {
    this._db = new WasmDB(filePath);
  }
  pragma(str) { this._db.exec(`PRAGMA ${str}`); }
  exec(sql) { return this._db.exec(sql); }
  prepare(sql) { return new StatementWrapper(this._db, sql); }
  close() { this._db.close(); }
}

const db = new DatabaseWrapper(path.join(__dirname, '../../database.sqlite'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    is_pro INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    label TEXT,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'France',
    is_default INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    parent_id TEXT,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (parent_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    short_description TEXT,
    price REAL NOT NULL,
    pro_price REAL,
    compare_price REAL,
    stock INTEGER DEFAULT 0,
    sku TEXT UNIQUE,
    category_id TEXT,
    brand TEXT,
    unit TEXT DEFAULT 'unité',
    weight REAL,
    is_active INTEGER DEFAULT 1,
    is_featured INTEGER DEFAULT 0,
    is_new INTEGER DEFAULT 0,
    images TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id TEXT,
    guest_email TEXT,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT DEFAULT 'stripe',
    stripe_payment_intent TEXT,
    subtotal REAL NOT NULL,
    shipping_cost REAL DEFAULT 0,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    shipping_address TEXT,
    billing_address TEXT,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    title TEXT,
    body TEXT,
    is_approved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    type TEXT DEFAULT 'percent',
    value REAL NOT NULL,
    min_amount REAL DEFAULT 0,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    expires_at TEXT,
    is_active INTEGER DEFAULT 1
  );
`);

module.exports = db;
