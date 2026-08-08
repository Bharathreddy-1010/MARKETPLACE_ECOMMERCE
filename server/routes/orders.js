const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'texflow_super_secret_jwt_key_2026';

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    // Fallback attempt with legacy key
    try {
      return jwt.verify(token, 'texflow-secret-key-2025');
    } catch (fallbackErr) {
      return null;
    }
  }
}

// Create Order (Checkout workflow)
router.post('/', async (req, res) => {
  try {
    let user = verifyToken(req);
    
    // If token verification failed but user details were sent or browsing as logged-in buyer, use fallback buyer identity
    if (!user) {
      user = {
        id: 'user_buyer_demo',
        name: 'Bharath Kumar Reddy B',
        email: 'buyer@demo.com',
        role: 'buyer',
        company: 'Aura Couture Paris'
      };
    }

    const { items, shippingAddress, notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    let totalAmount = 0;
    const processedItems = [];

    const products = await db.getProducts();

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      const unitPrice = product ? product.price : item.unitPrice || 10;
      const itemTotal = unitPrice * item.quantity;
      totalAmount += itemTotal;

      processedItems.push({
        productId: item.productId,
        productName: product ? product.name : item.productName || 'Fabric Quality',
        supplierId: product ? product.supplierId : 'user_supplier_demo',
        supplierName: product ? product.supplierName : 'Apex Mills International',
        color: item.color || (product && product.colors && product.colors[0]) || 'Standard',
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal
      });
    }

    const firstSupplierId = processedItems[0].supplierId;
    const firstSupplierName = processedItems[0].supplierName;
    const orderNum = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    const newOrder = {
      id: 'ord_' + Date.now(),
      orderNumber: orderNum,
      buyerId: user.id,
      buyerName: user.name || user.email || 'Bharath Kumar Reddy B',
      buyerCompany: user.company || 'Aura Couture Paris',
      supplierId: firstSupplierId,
      supplierName: firstSupplierName,
      items: processedItems,
      subtotal: Number(totalAmount.toFixed(2)),
      estShipping: 25.00,
      total: Number((totalAmount + 25).toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2)),
      status: 'Pending',
      notes: notes || '',
      shippingAddress: shippingAddress || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        {
          status: 'Pending',
          timestamp: new Date().toISOString(),
          note: 'Order submitted by buyer. Awaiting mill review.'
        }
      ]
    };

    await db.createOrder(newOrder);

    return res.status(201).json({
      message: 'Order placed successfully',
      order: newOrder
    });
  } catch (err) {
    console.error('Create Order error:', err);
    return res.status(500).json({ error: 'Failed to place order' });
  }
});

// Get Buyer Orders
router.get('/buyer', async (req, res) => {
  try {
    const user = verifyToken(req);
    const allOrders = await db.getOrders();
    const buyerOrders = user ? allOrders.filter(o => o.buyerId === user.id || user.email === 'buyer@demo.com') : allOrders;
    return res.json({ orders: buyerOrders.length > 0 ? buyerOrders : allOrders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch buyer orders' });
  }
});

// Get Supplier Orders (Supplier Mill Portal)
router.get('/supplier', async (req, res) => {
  try {
    const allOrders = await db.getOrders();
    return res.json({ orders: allOrders });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch supplier orders' });
  }
});

// Update Order Status (Supplier workflow)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'In Production', 'Dispatched', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const updatedOrder = await db.updateOrderStatus(req.params.id, status);

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.json({
      message: 'Order status updated',
      order: updatedOrder
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Sync Local Orders with Backend DB
router.post('/sync', async (req, res) => {
  try {
    const { orders } = req.body;
    if (Array.isArray(orders)) {
      for (const order of orders) {
        await db.createOrder(order);
      }
    }
    const all = await db.getOrders();
    return res.json({ orders: all });
  } catch (err) {
    return res.status(500).json({ error: 'Sync failed' });
  }
});

module.exports = router;
