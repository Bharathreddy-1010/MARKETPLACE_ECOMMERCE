const path = require('path');
const fs = require('fs');

const SEED_DATA_PATH = path.join(__dirname, 'data.json');

// In-Memory Relational Database Tables
let tables = null;

function getDbTables() {
  if (!tables) {
    tables = {
      users: [],
      products: [],
      orders: [],
      onboarding_profiles: []
    };

    if (fs.existsSync(SEED_DATA_PATH)) {
      try {
        const seedRaw = fs.readFileSync(SEED_DATA_PATH, 'utf8');
        const seedData = JSON.parse(seedRaw);
        if (Array.isArray(seedData.users)) tables.users = [...seedData.users];
        if (Array.isArray(seedData.products)) tables.products = [...seedData.products];
        if (Array.isArray(seedData.orders)) tables.orders = [...seedData.orders];
        if (Array.isArray(seedData.onboarding_profiles)) tables.onboarding_profiles = [...seedData.onboarding_profiles];
      } catch (e) {
        console.error('Error loading seed data into database:', e);
      }
    }
  }
  return tables;
}

// ── SQL QUERY ENGINE ──
async function runQuery(sql, params = []) {
  const db = getDbTables();
  const lowerSql = sql.toLowerCase().trim();

  if (lowerSql.startsWith('insert')) {
    if (lowerSql.includes('into users')) {
      const [id, email, password, name, role, companyName, onboardingCompleted, createdAt] = params;
      const newUser = { id, email, password, name, role, companyName, onboardingCompleted: Number(onboardingCompleted), createdAt };
      const idx = db.users.findIndex(u => u.id === id || (u.email || '').toLowerCase() === (email || '').toLowerCase());
      if (idx >= 0) db.users[idx] = { ...db.users[idx], ...newUser };
      else db.users.push(newUser);
    } else if (lowerSql.includes('into products')) {
      const [id, name, supplierId, supplierName, category, description, price, priceTiers, moq, stock, inStock, gsm, width, weave, fiberComposition, colors, certifications, images, createdAt] = params;
      const newProd = {
        id, name, supplierId, supplierName, category, description, price: Number(price),
        priceTiers, moq: Number(moq), stock: Number(stock), inStock: Boolean(inStock), gsm, width, weave,
        fiberComposition, colors, certifications, images, createdAt
      };
      const idx = db.products.findIndex(p => p.id === id);
      if (idx >= 0) db.products[idx] = newProd;
      else db.products.unshift(newProd);
    } else if (lowerSql.includes('into orders')) {
      const [id, buyerId, buyerName, buyerCompany, supplierId, supplierName, orderNumber, items, totalAmount, total, status, shippingAddress, paymentStatus, paymentMethod, notes, createdAt] = params;
      const newOrder = {
        id, buyerId, buyerName, buyerCompany, supplierId, supplierName, orderNumber, items,
        totalAmount: Number(totalAmount), total: Number(total || totalAmount), status, shippingAddress,
        paymentStatus, paymentMethod, notes, createdAt
      };
      const idx = db.orders.findIndex(o => o.id === id || o.orderNumber === orderNumber);
      if (idx >= 0) db.orders[idx] = { ...db.orders[idx], ...newOrder };
      else db.orders.unshift(newOrder);
    } else if (lowerSql.includes('into onboarding_profiles')) {
      const [userId, role, businessType, industry, categoriesOfInterest, preferredFabricTypes, typicalOrderQty, budgetRange, minOrderQty, contactPhone, operatingHours, notes] = params;
      const profile = { userId, role, businessType, industry, categoriesOfInterest, preferredFabricTypes, typicalOrderQty, budgetRange, minOrderQty, contactPhone, operatingHours, notes };
      const idx = db.onboarding_profiles.findIndex(p => p.userId === userId);
      if (idx >= 0) db.onboarding_profiles[idx] = profile;
      else db.onboarding_profiles.push(profile);
    }
  } else if (lowerSql.startsWith('update')) {
    if (lowerSql.includes('users set onboardingcompleted')) {
      const userId = params[0];
      const user = db.users.find(u => u.id === userId);
      if (user) user.onboardingCompleted = 1;
    } else if (lowerSql.includes('update products set')) {
      const [name, category, price, moq, stock, inStock, description, id] = params;
      const prod = db.products.find(p => p.id === id);
      if (prod) {
        Object.assign(prod, { name, category, price: Number(price), moq: Number(moq), stock: Number(stock), inStock: Boolean(inStock), description });
      }
    } else if (lowerSql.includes('update orders set status')) {
      const [status, orderId] = params;
      const order = db.orders.find(o => o.id === orderId || o.orderNumber === orderId);
      if (order) order.status = status;
    }
  } else if (lowerSql.startsWith('delete')) {
    if (lowerSql.includes('from products')) {
      const id = params[0];
      db.products = db.products.filter(p => p.id !== id);
    }
  }

  return { lastID: Date.now(), changes: 1 };
}

async function getQuery(sql, params = []) {
  const db = getDbTables();
  const lowerSql = sql.toLowerCase().trim();

  if (lowerSql.includes('from users')) {
    if (lowerSql.includes('email') || lowerSql.includes('lower(email)')) {
      const email = (params[0] || '').toLowerCase();
      return db.users.find(u => (u.email || '').toLowerCase() === email) || null;
    }
    if (lowerSql.includes('id =')) {
      const id = params[0];
      return db.users.find(u => u.id === id) || null;
    }
  }
  if (lowerSql.includes('from products')) {
    const id = params[0];
    const p = db.products.find(item => item.id === id);
    return p ? formatProductRow(p) : null;
  }
  if (lowerSql.includes('from orders')) {
    const id = params[0];
    return db.orders.find(o => o.id === id || o.orderNumber === id) || null;
  }
  if (lowerSql.includes('from onboarding_profiles')) {
    const userId = params[0];
    return db.onboarding_profiles.find(p => p.userId === userId) || null;
  }
  return null;
}

async function allQuery(sql, params = []) {
  const db = getDbTables();
  const lowerSql = sql.toLowerCase().trim();

  if (lowerSql.includes('from products')) {
    return db.products.map(formatProductRow);
  }
  if (lowerSql.includes('from orders')) {
    if (lowerSql.includes('buyerid =')) {
      const buyerId = params[0];
      return db.orders.filter(o => o.buyerId === buyerId);
    }
    return db.orders;
  }
  if (lowerSql.includes('from users')) {
    return db.users;
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
    `INSERT INTO users (id, email, password, name, role, companyName, onboardingCompleted, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, newUser.email, newUser.password, newUser.name, newUser.role, newUser.companyName, newUser.onboardingCompleted, newUser.createdAt]
  );
  return newUser;
}

// ── ORDER API HELPERS ──
async function getOrders() {
  const dbRows = await allQuery('SELECT * FROM orders');
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
  await runQuery('UPDATE orders SET status = ? WHERE id = ? OR orderNumber = ?', [status, orderId]);
  return getQuery('SELECT * FROM orders WHERE id = ? OR orderNumber = ?', [orderId, orderId]);
}

// ── ONBOARDING API HELPERS ──
async function getOnboardingProfile(userId) {
  return getQuery('SELECT * FROM onboarding_profiles WHERE userId = ?', [userId]);
}

async function saveOnboardingProfile(profileData) {
  await runQuery(
    `INSERT INTO onboarding_profiles (userId, role, businessType, industry, categoriesOfInterest, preferredFabricTypes, typicalOrderQty, budgetRange, minOrderQty, contactPhone, operatingHours, notes)
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

module.exports = {
  db: {
    serialize: (cb) => cb(),
    run: (sql, params, cb) => runQuery(sql, params).then(r => cb && cb.call(r, null)).catch(e => cb && cb(e))
  },
  initDb: () => Promise.resolve(),
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
