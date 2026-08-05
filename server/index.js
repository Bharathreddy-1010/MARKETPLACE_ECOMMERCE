try { require('dotenv').config(); } catch (e) {}
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db/database');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize database
db.initDb();

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'TexFlow B2B Marketplace API',
    timestamp: new Date().toISOString()
  });
});

// Serve frontend static build if available in production
const clientBuildPath = path.join(__dirname, '../client/dist');
if (require('fs').existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 MarketPlace Backend API running at http://localhost:${PORT}`);
    if (process.env.GROQ_API_KEY) {
      console.log('🤖 Groq AI API Key Loaded Successfully!');
    }
  });
}

module.exports = app;
