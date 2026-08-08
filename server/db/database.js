const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DB_PATH = isVercel ? '/tmp/texflow.db' : path.join(__dirname, 'texflow.db');
const SEED_DATA_PATH = path.join(__dirname, 'data.json');

let db = null;
let SQL = null;
let initPromise = null;

async function initDatabase() {
  if (db) return db;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      SQL = await initSqlJs();
      if (fs.existsSync(DB_PATH)) {
        const filebuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(filebuffer);
      } else {
        db = new SQL.Database();
      }
      console.log(`📦 Connected to WASM SQLite Database at ${DB_PATH}`);
      await createTablesAndSeed();
    } catch (err) {
      console.error('❌ Failed to initialize WASM SQLite Database:', err);
    }
    return db;
  })();

  return initPromise;
}

function saveDbToDisk() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (e) {
    // ignore on read-only file systems
  }
}

async function createTablesAndSeed() {
  if (!db) return;
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
    );
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
    );
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
    );
    CREATE TABLE IF NOT EXISTS onboarding_profiles (
      userId TEXT PRIMARY KEY,
      role TEXT,
      businessType TEXT,
      industry TEXT,
      categoriesOfInterest TEXT,
      preferredFabricTypes TEXT,
      typicalOrderQty TEXT,
      budgetRange TEXT,
      minOrderQty INTEGER,
      contactPhone TEXT,
      operatingHours TEXT,
      notes TEXT
    );
  `);

  try { db.run('ALTER TABLE orders ADD COLUMN buyerName TEXT;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN buyerCompany TEXT;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN supplierId TEXT;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN supplierName TEXT;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN paymentStatus TEXT;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN paymentMethod TEXT;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN notes TEXT;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN totalAmount REAL;'); } catch(e){}
  try { db.run('ALTER TABLE orders ADD COLUMN total REAL;'); } catch(e){}

  // Seed baseline data from data.json if products table is empty
  const checkStmt = db.prepare('SELECT COUNT(*) as count FROM products');
  let count = 0;
  if (checkStmt.step()) {
    count = checkStmt.getAsObject().count;
  }
  checkStmt.free();

  if (count === 0 && fs.existsSync(SEED_DATA_PATH)) {
    try {
      const seedRaw = fs.readFileSync(SEED_DATA_PATH, 'utf8');
      const seedData = JSON.parse(seedRaw);

      if (Array.isArray(seedData.users)) {
        for (const u of seedData.users) {
          db.run(
            `INSERT OR IGNORE INTO users (id, email, password, name, role, companyName, onboardingCompleted, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [u.id, u.email, u.password, u.name, u.role, u.companyName || u.company || '', u.onboardingCompleted ? 1 : 0, u.createdAt || new Date().toISOString()]
          );
        }
      }

      if (Array.isArray(seedData.products)) {
        for (const p of seedData.products) {
          db.run(
            `INSERT OR IGNORE INTO products (
              id, name, supplierId, supplierName, category, description, price, priceTiers,
              moq, stock, inStock, gsm, width, weave, fiberComposition, colors, certifications, images, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              p.id, p.name, p.supplierId || 'user_supplier_demo', p.supplierName || 'Apex Mills International',
              p.category, p.description || '', p.price, JSON.stringify(p.priceTiers || []),
              p.moq, p.stock, p.inStock ? 1 : 0, p.gsm || 150, p.width || '150 cm',
              p.weave || 'Plain', p.fiberComposition || '100% Cotton', JSON.stringify(p.colors || []),
              JSON.stringify(p.certifications || []), JSON.stringify(p.images || []), p.createdAt || new Date().toISOString()
            ]
          );
        }
      }

      if (Array.isArray(seedData.orders)) {
        for (const o of seedData.orders) {
          db.run(
            `INSERT OR IGNORE INTO orders (id, buyerId, buyerName, buyerCompany, supplierId, supplierName, orderNumber, items, totalAmount, total, status, shippingAddress, paymentStatus, paymentMethod, notes, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              o.id, o.buyerId, o.buyerName, o.buyerCompany,
              o.supplierId || 'user_supplier_demo', o.supplierName || 'Apex Mills International',
              o.orderNumber || o.id, JSON.stringify(o.items || []), o.totalAmount || o.total || 0, o.total || o.totalAmount || 0,
              o.status || 'Pending', JSON.stringify(o.shippingAddress || {}),
              o.paymentStatus || 'Paid', o.paymentMethod || 'Credit Card',
              o.notes || '', o.createdAt || new Date().toISOString()
            ]
          );
        }
      }

      saveDbToDisk();
    } catch (e) {
      console.error('Error seeding data:', e);
    }
  }
}

function sanitizeParams(params = []) {
  return params.map(p => (p === undefined ? null : p));
}

async function runQuery(sql, params = []) {
  const dbInst = await initDatabase();
  if (!dbInst) return { lastID: Date.now(), changes: 1 };
  dbInst.run(sql, sanitizeParams(params));
  saveDbToDisk();
  return { lastID: Date.now(), changes: 1 };
}

async function getQuery(sql, params = []) {
  const dbInst = await initDatabase();
  if (!dbInst) return null;
  const stmt = dbInst.prepare(sql);
  stmt.bind(sanitizeParams(params));
  let row = null;
  if (stmt.step()) {
    row = stmt.getAsObject();
  }
  stmt.free();
  return row;
}

async function allQuery(sql, params = []) {
  const dbInst = await initDatabase();
  if (!dbInst) return [];
  const stmt = dbInst.prepare(sql);
  stmt.bind(sanitizeParams(params));
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
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

// ── PRODUCT API HELPERS ──
async function getProducts() {
  const rows = await allQuery('SELECT * FROM products ORDER BY name ASC');
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
  if (!email) return null;
  return getQuery('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
}

async function findUserById(id) {
  if (!id) return null;
  return getQuery('SELECT * FROM users WHERE id = ?', [id]);
}

async function createUser(user) {
  const id = user.id || 'user_' + Date.now();
  const newUser = {
    ...user,
    id,
    companyName: user.company || user.companyName || '',
    onboardingCompleted: user.onboardingCompleted ? 1 : 0,
    createdAt: user.createdAt || new Date().toISOString()
  };

  await runQuery(
    `INSERT OR REPLACE INTO users (id, email, password, name, role, companyName, onboardingCompleted, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, newUser.email, newUser.password, newUser.name, newUser.role, newUser.companyName, newUser.onboardingCompleted, newUser.createdAt]
  );
  return newUser;
}

// ── ORDER API HELPERS ──
async function getOrders() {
  const dbRows = await allQuery('SELECT * FROM orders ORDER BY createdAt DESC');
  return dbRows.map(r => ({
    ...r,
    items: parseJsonField(r.items, []),
    shippingAddress: parseJsonField(r.shippingAddress, {})
  }));
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

  await runQuery(
    `INSERT OR REPLACE INTO orders (id, buyerId, buyerName, buyerCompany, supplierId, supplierName, orderNumber, items, totalAmount, total, status, shippingAddress, paymentStatus, paymentMethod, notes, createdAt)
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
  await runQuery('UPDATE orders SET status = ? WHERE id = ? OR orderNumber = ?', [status, orderId, orderId]);
  return getQuery('SELECT * FROM orders WHERE id = ? OR orderNumber = ?', [orderId, orderId]);
}

// ── ONBOARDING API HELPERS ──
async function getOnboardingProfile(userId) {
  return getQuery('SELECT * FROM onboarding_profiles WHERE userId = ?', [userId]);
}

async function saveOnboardingProfile(profileData) {
  await runQuery(
    `INSERT OR REPLACE INTO onboarding_profiles (userId, role, businessType, industry, categoriesOfInterest, preferredFabricTypes, typicalOrderQty, budgetRange, minOrderQty, contactPhone, operatingHours, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      profileData.userId, profileData.role, profileData.businessType, profileData.industry,
      JSON.stringify(profileData.categoriesOfInterest || []), JSON.stringify(profileData.preferredFabricTypes || []),
      profileData.typicalOrderQty, profileData.budgetRange, profileData.minOrderQty || 100,
      profileData.contactPhone, profileData.operatingHours, profileData.notes || ''
    ]
  );
  await runQuery('UPDATE users SET onboardingCompleted = 1 WHERE id = ?', [profileData.userId]);
  return profileData;
}

// Initialize database immediately on module import
initDatabase();

module.exports = {
  db: {
    serialize: (cb) => cb(),
    run: (sql, params, cb) => runQuery(sql, params).then(r => cb && cb.call(r, null)).catch(e => cb && cb(e))
  },
  initDb: initDatabase,
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
