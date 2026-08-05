const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'texflow_super_secret_jwt_key_2026';

// Helper auth middleware
function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Get all products with search & filters
router.get('/', async (req, res) => {
  try {
    let products = await db.getProducts();
    const {
      search,
      category,
      minGsm,
      maxGsm,
      minPrice,
      maxPrice,
      maxMoq,
      certification,
      weave,
      supplierId,
      featured,
      inStockOnly,
      sortBy
    } = req.query;

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.fiberComposition && p.fiberComposition.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.weave && p.weave.toLowerCase().includes(q)) ||
        (p.supplierName && p.supplierName.toLowerCase().includes(q)) ||
        (p.colors && p.colors.some(c => c.toLowerCase().includes(q)))
      );
    }

    if (category && category !== 'All' && category !== 'All qualities') {
      products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (minGsm) {
      products = products.filter(p => p.gsm >= Number(minGsm));
    }

    if (maxGsm) {
      products = products.filter(p => p.gsm <= Number(maxGsm));
    }

    if (minPrice) {
      products = products.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      products = products.filter(p => p.price <= Number(maxPrice));
    }

    if (maxMoq) {
      products = products.filter(p => p.moq <= Number(maxMoq));
    }

    if (supplierId) {
      products = products.filter(p => p.supplierId === supplierId);
    }

    if (featured === 'true') {
      products = products.filter(p => p.featured === true);
    }

    if (inStockOnly === 'true') {
      products = products.filter(p => p.inStock && p.stock > 0);
    }

    if (certification) {
      products = products.filter(p =>
        p.certifications && p.certifications.some(c => c.toLowerCase().includes(certification.toLowerCase()))
      );
    }

    // Sorting
    if (sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'gsm_asc') {
      products.sort((a, b) => a.gsm - b.gsm);
    } else if (sortBy === 'gsm_desc') {
      products.sort((a, b) => b.gsm - a.gsm);
    } else if (sortBy === 'moq_asc') {
      products.sort((a, b) => a.moq - b.moq);
    }

    return res.json({
      count: products.length,
      products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get Categories & Metadata summary
router.get('/meta/categories', async (req, res) => {
  try {
    const products = await db.getProducts();
    const categories = [...new Set(products.map(p => p.category))];
    const certifications = [...new Set(products.flatMap(p => p.certifications || []))];
    const weaves = [...new Set(products.map(p => p.weave).filter(Boolean))];

    return res.json({
      categories,
      certifications,
      weaves,
      totalProducts: products.length
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single product detail
router.get('/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (Supplier only)
router.post('/', async (req, res) => {
  try {
    const user = verifyToken(req);
    if (!user || user.role !== 'supplier') {
      return res.status(403).json({ error: 'Only authorized suppliers can create products' });
    }

    const {
      name,
      category,
      description,
      price,
      moq,
      stock,
      gsm,
      width,
      weave,
      fiberComposition,
      colors,
      certifications,
      images,
      unit
    } = req.body;

    if (!name || !category || !price || !moq) {
      return res.status(400).json({ error: 'Please provide product name, category, price, and MOQ' });
    }

    const newProduct = {
      id: 'prod_' + Date.now(),
      supplierId: user.id,
      supplierName: user.name || 'Apex Mills International',
      name,
      category,
      description: description || '',
      price: Number(price),
      priceTiers: [
        { minQty: Number(moq), price: Number(price) },
        { minQty: Number(moq) * 5, price: Number(price) * 0.9 }
      ],
      moq: Number(moq),
      stock: Number(stock || 1000),
      unit: unit || 'meter',
      gsm: Number(gsm || 150),
      width: width || '150 cm (59")',
      weave: weave || 'Plain Weave',
      fiberComposition: fiberComposition || '100% Cotton',
      colors: Array.isArray(colors) ? colors : (colors ? colors.split(',').map(c => c.trim()) : ['Natural']),
      certifications: Array.isArray(certifications) ? certifications : (certifications ? certifications.split(',').map(c => c.trim()) : []),
      images: Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80'],
      featured: false,
      inStock: Number(stock) > 0,
      createdAt: new Date().toISOString()
    };

    await db.createProduct(newProduct);
    return res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (Supplier only)
router.put('/:id', async (req, res) => {
  try {
    const user = verifyToken(req);
    if (!user || user.role !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const product = await db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.supplierId !== user.id && user.email !== 'supplier@demo.com') {
      return res.status(403).json({ error: 'You do not have permission to modify this product' });
    }

    const updated = await db.updateProduct(req.params.id, req.body);
    return res.json({ message: 'Product updated successfully', product: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (Supplier only)
router.delete('/:id', async (req, res) => {
  try {
    const user = verifyToken(req);
    if (!user || user.role !== 'supplier') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const deleted = await db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    return res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
