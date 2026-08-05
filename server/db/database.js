const path = require('path');
const fs = require('fs');

let sqlite3;
try {
  sqlite3 = require('sqlite3').verbose();
} catch (e) {
  console.warn('⚠️ SQLite3 native module failed to load. Using in-memory fallback store.');
}

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const LOCAL_DB = path.join(__dirname, 'texflow.db');
const DB_PATH = isVercel ? '/tmp/texflow.db' : LOCAL_DB;
const SEED_DATA_PATH = path.join(__dirname, 'data.json');

if (isVercel && fs.existsSync(LOCAL_DB) && !fs.existsSync('/tmp/texflow.db')) {
  try {
    fs.copyFileSync(LOCAL_DB, '/tmp/texflow.db');
  } catch (e) {
    console.error('Failed to copy database to /tmp:', e.message);
  }
}

let db = null;
if (sqlite3) {
  try {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) console.error('❌ Failed to connect to SQLite Database:', err.message);
      else console.log(`📦 Connected to SQLite Database at ${DB_PATH}`);
    });
  } catch (e) {
    console.warn('⚠️ Could not initialize SQLite instance:', e.message);
  }
}

// In-memory JSON fallback store for serverless environments
let memoryStore = null;
function getMemoryStore() {
  if (!memoryStore) {
    try {
      const data = fs.readFileSync(SEED_DATA_PATH, 'utf8');
      memoryStore = JSON.parse(data);
    } catch (e) {
      memoryStore = { users: [], products: [], orders: [], onboarding_profiles: [] };
    }
  }
  return memoryStore;
}

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.run(sql, params, function (err) {
        if (err) resolve({ lastID: Date.now(), changes: 1 });
        else resolve(this);
      });
    } else {
      resolve({ lastID: Date.now(), changes: 1 });
    }
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.get(sql, params, (err, row) => {
        if (err || !row) resolve(inMemoryGet(sql, params));
        else resolve(row);
      });
    } else {
      resolve(inMemoryGet(sql, params));
    }
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (db) {
      db.all(sql, params, (err, rows) => {
        if (err || !rows || rows.length === 0) resolve(inMemoryAll(sql, params));
        else resolve(rows);
      });
    } else {
      resolve(inMemoryAll(sql, params));
    }
  });
}

function inMemoryGet(sql, params) {
  const store = getMemoryStore();
  const lowerSql = sql.toLowerCase();

  if (lowerSql.includes('from users')) {
    if (lowerSql.includes('email =')) {
      const email = params[0];
      return store.users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase()) || null;
    }
    if (lowerSql.includes('id =')) {
      const id = params[0];
      return store.users.find(u => u.id === id) || null;
    }
  }
  if (lowerSql.includes('from products')) {
    const id = params[0];
    const item = store.products.find(p => p.id === id);
    if (!item) return null;
    return formatProductRow(item);
  }
  return null;
}

function inMemoryAll(sql, params) {
  const store = getMemoryStore();
  const lowerSql = sql.toLowerCase();

  if (lowerSql.includes('from products')) {
    return store.products.map(formatProductRow);
  }
  if (lowerSql.includes('from orders')) {
    return store.orders || [];
  }
  return [];
}

function formatProductRow(p) {
  return {
    ...p,
    priceTiers: typeof p.priceTiers === 'string' ? p.priceTiers : JSON.stringify(p.priceTiers || []),
    colors: typeof p.colors === 'string' ? p.colors : JSON.stringify(p.colors || []),
    certifications: typeof p.certifications === 'string' ? p.certifications : JSON.stringify(p.certifications || []),
    images: typeof p.images === 'string' ? p.images : JSON.stringify(p.images || []),
    leadTimes: typeof p.leadTimes === 'string' ? p.leadTimes : JSON.stringify(p.leadTimes || {}),
    ecoMetrics: typeof p.ecoMetrics === 'string' ? p.ecoMetrics : JSON.stringify(p.ecoMetrics || {}),
    millDetails: typeof p.millDetails === 'string' ? p.millDetails : JSON.stringify(p.millDetails || {})
  };
}

function parseJsonField(val, fallback) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch (e) { return fallback; }
}

function parseProductRow(p) {
  if (!p) return null;
  return {
    ...p,
    priceTiers: parseJsonField(p.priceTiers, []),
    colors: parseJsonField(p.colors, []),
    certifications: parseJsonField(p.certifications, []),
    images: parseJsonField(p.images, []),
    leadTimes: parseJsonField(p.leadTimes, {}),
    ecoMetrics: parseJsonField(p.ecoMetrics, {}),
    millDetails: parseJsonField(p.millDetails, {}),
    inStock: Boolean(p.inStock)
  };
}

async function initDb() {
  if (!db) return;
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT,
        role TEXT NOT NULL,
        companyName TEXT,
        onboardingCompleted INTEGER DEFAULT 0,
        createdAt TEXT
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        supplierId TEXT,
        supplierName TEXT,
        category TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        priceTiers TEXT,
        moq INTEGER NOT NULL,
        stock INTEGER NOT NULL,
        inStock INTEGER DEFAULT 1,
        gsm INTEGER,
        width TEXT,
        weave TEXT,
        fiberComposition TEXT,
        colors TEXT,
        certifications TEXT,
        leadTimes TEXT,
        ecoMetrics TEXT,
        millDetails TEXT,
        images TEXT,
        rating REAL DEFAULT 4.8,
        reviewCount INTEGER DEFAULT 0,
        createdAt TEXT
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        buyerId TEXT NOT NULL,
        buyerName TEXT,
        buyerCompany TEXT,
        supplierId TEXT,
        supplierName TEXT,
        orderNumber TEXT UNIQUE NOT NULL,
        items TEXT NOT NULL,
        totalAmount REAL,
        total REAL,
        status TEXT NOT NULL,
        shippingAddress TEXT,
        paymentStatus TEXT,
        paymentMethod TEXT,
        notes TEXT,
        createdAt TEXT
      )
    `);
  });
}

// ── PRODUCT API HELPERS ──
async function getProducts() {
  const rows = await allQuery('SELECT * FROM products');
  return rows.map(parseProductRow);
}

async function getProductById(id) {
  const row = await getQuery('SELECT * FROM products WHERE id = ?', [id]);
  return parseProductRow(row);
}

async function createProduct(prod) {
  const id = prod.id || 'prod_' + Date.now();
  await runQuery(
    `INSERT INTO products (
      id, name, supplierId, supplierName, category, description, price, priceTiers,
      moq, stock, inStock, gsm, width, weave, fiberComposition, colors, certifications, images, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, prod.name, prod.supplierId || 'user_supplier_demo', prod.supplierName || 'Apex Mills International',
      prod.category, prod.description || '', prod.price, JSON.stringify(prod.priceTiers || []),
      prod.moq, prod.stock, prod.inStock ? 1 : 0, prod.gsm || 150, prod.width || '150 cm',
      prod.weave || 'Plain', prod.fiberComposition || '100% Cotton', JSON.stringify(prod.colors || []),
      JSON.stringify(prod.certifications || []), JSON.stringify(prod.images || []), new Date().toISOString()
    ]
  );
  return getProductById(id);
}

async function updateProduct(id, updates) {
  const existing = await getProductById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };
  await runQuery(
    `UPDATE products SET name=?, category=?, price=?, moq=?, stock=?, inStock=?, description=? WHERE id=?`,
    [merged.name, merged.category, merged.price, merged.moq, merged.stock, merged.inStock ? 1 : 0, merged.description, id]
  );
  return getProductById(id);
}

async function deleteProduct(id) {
  await runQuery('DELETE FROM products WHERE id = ?', [id]);
  return true;
}

// ── USER API HELPERS ──
async function findUserByEmail(email) {
  return getQuery('SELECT * FROM users WHERE email = ?', [email]);
}

async function findUserById(id) {
  return getQuery('SELECT * FROM users WHERE id = ?', [id]);
}

async function createUser(user) {
  const id = user.id || 'user_' + Date.now();
  await runQuery(
    `INSERT INTO users (id, email, password, name, role, companyName, onboardingCompleted, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, user.email, user.password, user.name, user.role, user.company || user.companyName || '', 0, user.createdAt || new Date().toISOString()]
  );
  return findUserById(id);
}

// ── ORDER API HELPERS ──
async function getBuyerOrders(buyerId) {
  const rows = await allQuery('SELECT * FROM orders WHERE buyerId = ? ORDER BY createdAt DESC', [buyerId]);
  return rows.map(r => ({
    ...r,
    items: parseJsonField(r.items, []),
    shippingAddress: parseJsonField(r.shippingAddress, {})
  }));
}

async function getSupplierOrders() {
  const rows = await allQuery('SELECT * FROM orders ORDER BY createdAt DESC');
  return rows.map(r => ({
    ...r,
    items: parseJsonField(r.items, []),
    shippingAddress: parseJsonField(r.shippingAddress, {})
  }));
}

async function createOrder(orderData) {
  const id = orderData.id || 'ord_' + Date.now();
  const orderNumber = orderData.orderNumber || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = orderData.totalAmount || orderData.total || 0;
  
  await runQuery(
    `INSERT INTO orders (id, buyerId, buyerName, buyerCompany, supplierId, supplierName, orderNumber, items, totalAmount, total, status, shippingAddress, paymentStatus, paymentMethod, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, orderData.buyerId, orderData.buyerName, orderData.buyerCompany,
      orderData.supplierId || 'user_supplier_demo', orderData.supplierName || 'Apex Mills International',
      orderNumber, JSON.stringify(orderData.items || []), totalAmount, totalAmount,
      orderData.status || 'Pending', JSON.stringify(orderData.shippingAddress || {}),
      orderData.paymentStatus || 'Paid', orderData.paymentMethod || 'Credit Card',
      orderData.notes || '', new Date().toISOString()
    ]
  );
  return { id, orderNumber, totalAmount, ...orderData };
}

async function updateOrderStatus(orderId, status) {
  await runQuery('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return true;
}

module.exports = {
  db,
  initDb,
  runQuery,
  getQuery,
  allQuery,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  findUserByEmail,
  findUserById,
  createUser,
  getBuyerOrders,
  getSupplierOrders,
  createOrder,
  updateOrderStatus,
  parseProductRow,
  parseJsonField
};
