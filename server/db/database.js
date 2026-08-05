const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'texflow.db');
const SEED_DATA_PATH = path.join(__dirname, 'data.json');

// Connect to SQLite Database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite Database:', err.message);
  } else {
    console.log('📦 Connected to SQLite Database at server/db/texflow.db');
  }
});

// Helper for Promisified Queries
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Initialize SQLite Schema & Seed Initial Data if Empty
async function initDb() {
  db.serialize(async () => {
    // 1. Users Table
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

    // 2. Onboarding Profiles Table
    db.run(`
      CREATE TABLE IF NOT EXISTS onboarding_profiles (
        id TEXT PRIMARY KEY,
        userId TEXT UNIQUE NOT NULL,
        role TEXT,
        data TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

    // 3. Products Table
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        supplierId TEXT,
        supplierName TEXT,
        category TEXT,
        description TEXT,
        price REAL,
        moq INTEGER,
        stock INTEGER,
        unit TEXT,
        gsm INTEGER,
        width TEXT,
        weave TEXT,
        fiberComposition TEXT,
        leadTimeDays INTEGER,
        countryOfOrigin TEXT,
        colors TEXT,
        certifications TEXT,
        images TEXT,
        priceTiers TEXT,
        featured INTEGER DEFAULT 0,
        inStock INTEGER DEFAULT 1,
        createdAt TEXT
      )
    `);

    // 4. Orders Table
    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        orderNumber TEXT UNIQUE NOT NULL,
        buyerId TEXT,
        buyerName TEXT,
        supplierId TEXT,
        supplierName TEXT,
        items TEXT,
        shippingAddress TEXT,
        subtotal REAL,
        estShipping REAL,
        total REAL,
        totalAmount REAL,
        status TEXT,
        history TEXT,
        createdAt TEXT,
        updatedAt TEXT
      )
    `);

    // Auto-migrate missing columns for existing SQLite database files
    db.run(`ALTER TABLE orders ADD COLUMN supplierId TEXT`, () => {});
    db.run(`ALTER TABLE orders ADD COLUMN supplierName TEXT`, () => {});
    db.run(`ALTER TABLE orders ADD COLUMN totalAmount REAL`, () => {});

    // Seed Data from data.json if Products Table is Empty
    db.get('SELECT COUNT(*) as count FROM products', async (err, row) => {
      if (!err && row && row.count === 0) {
        console.log('🌱 Seeding SQLite database from data.json...');
        try {
          if (fs.existsSync(SEED_DATA_PATH)) {
            const seedData = JSON.parse(fs.readFileSync(SEED_DATA_PATH, 'utf8'));

            // Seed Users
            if (seedData.users) {
              for (const u of seedData.users) {
                await runQuery(`
                  INSERT OR IGNORE INTO users (id, email, password, name, role, companyName, onboardingCompleted, createdAt)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [u.id, u.email, u.password, u.name, u.role, u.companyName || '', u.onboardingCompleted ? 1 : 0, u.createdAt || new Date().toISOString()]);
              }
            }

            // Seed Products
            if (seedData.products) {
              for (const p of seedData.products) {
                await runQuery(`
                  INSERT OR IGNORE INTO products (
                    id, name, supplierId, supplierName, category, description, price, moq, stock, unit, gsm, width, weave,
                    fiberComposition, leadTimeDays, countryOfOrigin, colors, certifications, images, priceTiers, featured, inStock, createdAt
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  p.id, p.name, p.supplierId, p.supplierName, p.category, p.description, p.price, p.moq, p.stock, p.unit, p.gsm, p.width, p.weave,
                  p.fiberComposition, p.leadTimeDays || 7, p.countryOfOrigin || 'India',
                  JSON.stringify(p.colors || []), JSON.stringify(p.certifications || []), JSON.stringify(p.images || []), JSON.stringify(p.priceTiers || []),
                  p.featured ? 1 : 0, p.inStock ? 1 : 0, p.createdAt || new Date().toISOString()
                ]);
              }
            }

            // Seed Orders
            if (seedData.orders) {
              for (const o of seedData.orders) {
                await runQuery(`
                  INSERT OR IGNORE INTO orders (
                    id, orderNumber, buyerId, buyerName, supplierId, supplierName, items, shippingAddress, subtotal, estShipping, total, totalAmount, status, history, createdAt, updatedAt
                  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                  o.id, o.orderNumber, o.buyerId, o.buyerName, o.supplierId || 'user_supplier_demo', o.supplierName || 'Apex Mills International',
                  JSON.stringify(o.items || []), JSON.stringify(o.shippingAddress || {}),
                  o.subtotal || o.totalAmount, o.estShipping || 25, o.total || o.totalAmount, o.totalAmount || o.total, o.status, JSON.stringify(o.history || []),
                  o.createdAt || new Date().toISOString(), o.updatedAt || new Date().toISOString()
                ]);
              }
            }

            console.log('✅ SQLite Database Seeding Complete!');
          }
        } catch (seedErr) {
          console.error('Error seeding SQLite database:', seedErr);
        }
      }
    });
  });
}

// Database Operations Sync API Layer
module.exports = {
  db,
  initDb,

  findUserByEmail: (email) => {
    return getQuery('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]).then(u => {
      if (!u) return null;
      return { ...u, onboardingCompleted: !!u.onboardingCompleted };
    });
  },

  findUserById: (id) => {
    return getQuery('SELECT * FROM users WHERE id = ?', [id]).then(u => {
      if (!u) return null;
      return { ...u, onboardingCompleted: !!u.onboardingCompleted };
    });
  },

  createUser: async (user) => {
    await runQuery(`
      INSERT INTO users (id, email, password, name, role, companyName, onboardingCompleted, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [user.id, user.email, user.password, user.name, user.role, user.companyName || '', user.onboardingCompleted ? 1 : 0, user.createdAt || new Date().toISOString()]);
    return user;
  },

  saveOnboardingProfile: async (profile) => {
    const existing = await getQuery('SELECT * FROM onboarding_profiles WHERE userId = ?', [profile.userId]);
    const now = new Date().toISOString();
    if (existing) {
      await runQuery(`
        UPDATE onboarding_profiles SET role = ?, data = ?, updatedAt = ? WHERE userId = ?
      `, [profile.role, JSON.stringify(profile), now, profile.userId]);
    } else {
      await runQuery(`
        INSERT INTO onboarding_profiles (id, userId, role, data, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [profile.id || `profile_${Date.now()}`, profile.userId, profile.role, JSON.stringify(profile), now, now]);
    }

    await runQuery('UPDATE users SET onboardingCompleted = 1 WHERE id = ?', [profile.userId]);
    return profile;
  },

  getOnboardingProfile: async (userId) => {
    const row = await getQuery('SELECT * FROM onboarding_profiles WHERE userId = ?', [userId]);
    if (!row) return null;
    return JSON.parse(row.data);
  },

  getProducts: async () => {
    const rows = await allQuery('SELECT * FROM products ORDER BY createdAt DESC');
    return rows.map(p => ({
      ...p,
      featured: !!p.featured,
      inStock: !!p.inStock,
      colors: JSON.parse(p.colors || '[]'),
      certifications: JSON.parse(p.certifications || '[]'),
      images: JSON.parse(p.images || '[]'),
      priceTiers: JSON.parse(p.priceTiers || '[]')
    }));
  },

  getProductById: async (id) => {
    const p = await getQuery('SELECT * FROM products WHERE id = ?', [id]);
    if (!p) return null;
    return {
      ...p,
      featured: !!p.featured,
      inStock: !!p.inStock,
      colors: JSON.parse(p.colors || '[]'),
      certifications: JSON.parse(p.certifications || '[]'),
      images: JSON.parse(p.images || '[]'),
      priceTiers: JSON.parse(p.priceTiers || '[]')
    };
  },

  createProduct: async (p) => {
    const now = new Date().toISOString();
    await runQuery(`
      INSERT INTO products (
        id, name, supplierId, supplierName, category, description, price, moq, stock, unit, gsm, width, weave,
        fiberComposition, leadTimeDays, countryOfOrigin, colors, certifications, images, priceTiers, featured, inStock, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.id, p.name, p.supplierId, p.supplierName, p.category, p.description, p.price, p.moq, p.stock, p.unit, p.gsm, p.width, p.weave,
      p.fiberComposition, p.leadTimeDays || 7, p.countryOfOrigin || 'India',
      JSON.stringify(p.colors || []), JSON.stringify(p.certifications || []), JSON.stringify(p.images || []), JSON.stringify(p.priceTiers || []),
      p.featured ? 1 : 0, p.inStock ? 1 : 0, now
    ]);
    return { ...p, createdAt: now };
  },

  updateProduct: async (id, updates) => {
    const existing = await getQuery('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) return null;

    const merged = { ...existing, ...updates };
    await runQuery(`
      UPDATE products SET
        name = ?, category = ?, description = ?, price = ?, moq = ?, stock = ?, unit = ?, gsm = ?, width = ?, weave = ?,
        fiberComposition = ?, leadTimeDays = ?, countryOfOrigin = ?, colors = ?, certifications = ?, images = ?, priceTiers = ?,
        featured = ?, inStock = ?
      WHERE id = ?
    `, [
      merged.name, merged.category, merged.description, merged.price, merged.moq, merged.stock, merged.unit, merged.gsm, merged.width, merged.weave,
      merged.fiberComposition, merged.leadTimeDays, merged.countryOfOrigin,
      JSON.stringify(merged.colors || []), JSON.stringify(merged.certifications || []), JSON.stringify(merged.images || []), JSON.stringify(merged.priceTiers || []),
      merged.featured ? 1 : 0, merged.inStock ? 1 : 0, id
    ]);
    return merged;
  },

  deleteProduct: async (id) => {
    const res = await runQuery('DELETE FROM products WHERE id = ?', [id]);
    return res.changes > 0;
  },

  getOrders: async () => {
    const rows = await allQuery('SELECT * FROM orders ORDER BY createdAt DESC');
    return rows.map(o => ({
      ...o,
      items: JSON.parse(o.items || '[]'),
      shippingAddress: JSON.parse(o.shippingAddress || '{}'),
      history: JSON.parse(o.history || '[]')
    }));
  },

  createOrder: async (o) => {
    const now = new Date().toISOString();
    await runQuery(`
      INSERT INTO orders (
        id, orderNumber, buyerId, buyerName, supplierId, supplierName, items, shippingAddress, subtotal, estShipping, total, totalAmount, status, history, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      o.id, o.orderNumber, o.buyerId, o.buyerName, o.supplierId || 'user_supplier_demo', o.supplierName || 'Apex Mills International',
      JSON.stringify(o.items || []), JSON.stringify(o.shippingAddress || {}),
      o.subtotal || o.totalAmount, o.estShipping || 25, o.total || o.totalAmount, o.totalAmount || o.total, o.status, JSON.stringify(o.history || []),
      now, now
    ]);
    return { ...o, createdAt: now, updatedAt: now };
  },

  updateOrderStatus: async (orderId, status) => {
    const o = await getQuery('SELECT * FROM orders WHERE id = ?', [orderId]);
    if (!o) return null;

    const history = JSON.parse(o.history || '[]');
    const now = new Date().toISOString();
    history.push({ status, timestamp: now, note: `Order status updated to ${status}` });

    await runQuery('UPDATE orders SET status = ?, history = ?, updatedAt = ? WHERE id = ?', [status, JSON.stringify(history), now, orderId]);
    return { ...o, status, history, updatedAt: now };
  }
};
