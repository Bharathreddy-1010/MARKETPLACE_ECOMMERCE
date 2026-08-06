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

// In-memory JSON store for serverless environments & real-time sync
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
    if (lowerSql.includes('email =') || lowerSql.includes('lower(email) =')) {
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
  const store = getMemoryStore();
  const id = prod.id || 'prod_' + Date.now();
  const newProd = {
    ...prod,
    id,
    supplierId: prod.supplierId || 'user_supplier_demo',
    supplierName: prod.supplierName || 'Apex Mills International',
    inStock: prod.inStock ?? true,
    createdAt: new Date().toISOString()
  };
  
  if (!store.products) store.products = [];
  store.products.unshift(newProd);

  await runQuery(
    `INSERT INTO products (
      id, name, supplierId, supplierName, category, description, price, priceTiers,
      moq, stock, inStock, gsm, width, weave, fiberComposition, colors, certifications, images, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, newProd.name, newProd.supplierId, newProd.supplierName,
      newProd.category, newProd.description || '', newProd.price, JSON.stringify(newProd.priceTiers || []),
      newProd.moq, newProd.stock, newProd.inStock ? 1 : 0, newProd.gsm || 150, newProd.width || '150 cm',
      newProd.weave || 'Plain', newProd.fiberComposition || '100% Cotton', JSON.stringify(newProd.colors || []),
      JSON.stringify(newProd.certifications || []), JSON.stringify(newProd.images || []), newProd.createdAt
    ]
  );
  return getProductById(id);
}

async function updateProduct(id, updates) {
  const existing = await getProductById(id);
  if (!existing) return null;
  const merged = { ...existing, ...updates };

  const store = getMemoryStore();
  if (store.products) {
    const idx = store.products.findIndex(p => p.id === id);
    if (idx >= 0) store.products[idx] = merged;
  }

  await runQuery(
    `UPDATE products SET name=?, category=?, price=?, moq=?, stock=?, inStock=?, description=? WHERE id=?`,
    [merged.name, merged.category, merged.price, merged.moq, merged.stock, merged.inStock ? 1 : 0, merged.description, id]
  );
  return getProductById(id);
}

async function deleteProduct(id) {
  const store = getMemoryStore();
  if (store.products) {
    store.products = store.products.filter(p => p.id !== id);
  }
  await runQuery('DELETE FROM products WHERE id = ?', [id]);
  return true;
}

// ── USER API HELPERS ──
async function findUserByEmail(email) {
  if (!email) return null;
  const store = getMemoryStore();
  const foundInMemory = store.users.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());
  if (foundInMemory) return foundInMemory;

  return getQuery('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
}

async function findUserById(id) {
  if (!id) return null;
  const store = getMemoryStore();
  const foundInMemory = store.users.find(u => u.id === id);
  if (foundInMemory) return foundInMemory;

  return getQuery('SELECT * FROM users WHERE id = ?', [id]);
}

async function createUser(user) {
  const store = getMemoryStore();
  if (!store.users) store.users = [];

  const id = user.id || 'user_' + Date.now();
  const newUser = {
    ...user,
    id,
    companyName: user.company || user.companyName || '',
    onboardingCompleted: user.onboardingCompleted ? 1 : 0,
    createdAt: user.createdAt || new Date().toISOString()
  };

  const existingIdx = store.users.findIndex(u => (u.email || '').toLowerCase() === (user.email || '').toLowerCase());
  if (existingIdx >= 0) {
    store.users[existingIdx] = newUser;
  } else {
    store.users.push(newUser);
  }

  await runQuery(
    `INSERT INTO users (id, email, password, name, role, companyName, onboardingCompleted, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, newUser.email, newUser.password, newUser.name, newUser.role, newUser.companyName, newUser.onboardingCompleted, newUser.createdAt]
  );
  return newUser;
}

// ── ORDER API HELPERS ──
async function getOrders() {
  const store = getMemoryStore();
  const dbRows = await allQuery('SELECT * FROM orders ORDER BY createdAt DESC');
  
  const map = new Map();
  (store.orders || []).forEach(o => map.set(o.id || o.orderNumber, o));
  dbRows.forEach(r => {
    const formatted = {
      ...r,
      items: parseJsonField(r.items, []),
      shippingAddress: parseJsonField(r.shippingAddress, {})
    };
    map.set(r.id || r.orderNumber, formatted);
  });
  
  return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function getBuyerOrders(buyerId) {
  const all = await getOrders();
  if (!buyerId) return all;
  const filtered = all.filter(o => o.buyerId === buyerId || o.buyerEmail === buyerId);
  return filtered.length > 0 ? filtered : all;
}

async function getSupplierOrders() {
  return getOrders();
}

async function createOrder(orderData) {
  const store = getMemoryStore();
  if (!store.orders) store.orders = [];

  const id = orderData.id || 'ord_' + Date.now();
  const orderNumber = orderData.orderNumber || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = orderData.totalAmount || orderData.total || 0;

  const fullOrder = {
    ...orderData,
    id,
    orderNumber,
    totalAmount,
    total: totalAmount,
    status: orderData.status || 'Pending',
    createdAt: orderData.createdAt || new Date().toISOString()
  };

  store.orders.unshift(fullOrder);

  await runQuery(
    `INSERT INTO orders (id, buyerId, buyerName, buyerCompany, supplierId, supplierName, orderNumber, items, totalAmount, total, status, shippingAddress, paymentStatus, paymentMethod, notes, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, fullOrder.buyerId, fullOrder.buyerName, fullOrder.buyerCompany,
      fullOrder.supplierId || 'user_supplier_demo', fullOrder.supplierName || 'Apex Mills International',
      orderNumber, JSON.stringify(fullOrder.items || []), totalAmount, totalAmount,
      fullOrder.status || 'Pending', JSON.stringify(fullOrder.shippingAddress || {}),
      fullOrder.paymentStatus || 'Paid', fullOrder.paymentMethod || 'Credit Card',
      fullOrder.notes || '', fullOrder.createdAt
    ]
  );
  return fullOrder;
}

async function updateOrderStatus(orderId, status) {
  const store = getMemoryStore();
  if (store.orders) {
    const found = store.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (found) found.status = status;
  }
  await runQuery('UPDATE orders SET status = ? WHERE id = ? OR orderNumber = ?', [status, orderId, orderId]);
  return true;
}

// ── ONBOARDING API HELPERS ──
async function getOnboardingProfile(userId) {
  const store = getMemoryStore();
  const found = (store.onboarding_profiles || []).find(p => p.userId === userId);
  if (found) return found;
  return getQuery('SELECT * FROM onboarding_profiles WHERE userId = ?', [userId]);
}

async function saveOnboardingProfile(profileData) {
  const store = getMemoryStore();
  if (!store.onboarding_profiles) store.onboarding_profiles = [];
  const existingIdx = store.onboarding_profiles.findIndex(p => p.userId === profileData.userId);
  if (existingIdx >= 0) {
    store.onboarding_profiles[existingIdx] = { ...store.onboarding_profiles[existingIdx], ...profileData };
  } else {
    store.onboarding_profiles.push(profileData);
  }

  if (store.users) {
    const user = store.users.find(u => u.id === profileData.userId);
    if (user) user.onboardingCompleted = 1;
  }

  await runQuery('UPDATE users SET onboardingCompleted = 1 WHERE id = ?', [profileData.userId]);
  return profileData;
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
  getOrders,
  getBuyerOrders,
  getSupplierOrders,
  createOrder,
  updateOrderStatus,
  getOnboardingProfile,
  saveOnboardingProfile,
  parseProductRow,
  parseJsonField
};
