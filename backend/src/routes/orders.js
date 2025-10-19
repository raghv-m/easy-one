const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authMiddleware, requireRole(['Front Staff', 'Manager']), async (req, res) => {
  try {
    const { tableId, items, discountAmount, notes } = req.body;
    const { orgId } = req.user;

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ error: 'Table ID and items required' });
    }

    // Create order document
    const orderRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc();

    const orderId = orderRef.id;
    const now = new Date();

    // Group items by category for routing
    const itemsByCategory = {};
    items.forEach(item => {
      if (!itemsByCategory[item.category]) {
        itemsByCategory[item.category] = [];
      }
      itemsByCategory[item.category].push({
        ...item,
        status: 'pending',
        createdAt: now,
      });
    });

    await orderRef.set({
      orderId,
      tableId,
      items,
      itemsByCategory,
      discountAmount: discountAmount || 0,
      notes: notes || '',
      status: 'active',
      createdBy: req.user.uid,
      createdAt: now,
      updatedAt: now,
    });

    // Create kitchen screen entries for each category
    for (const [category, categoryItems] of Object.entries(itemsByCategory)) {
      await getDb()
        .collection('organizations')
        .doc(orgId)
        .collection('kitchenScreens')
        .add({
          orderId,
          tableId,
          category,
          items: categoryItems,
          status: 'pending',
          createdAt: now,
        });
    }

    res.status(201).json({
      orderId,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get orders for organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { status, tableId } = req.query;

    let query = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders');

    if (status) {
      query = query.where('status', '==', status);
    }

    if (tableId) {
      query = query.where('tableId', '==', tableId);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single order
router.get('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId } = req.params;

    const doc = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
router.patch('/:orderId', authMiddleware, requireRole(['Kitchen Staff', 'Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status required' });
    }

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId)
      .update({
        status,
        updatedAt: new Date(),
      });

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start cooking an order item
router.post('/:orderId/items/:itemId/start-cooking', authMiddleware, requireRole(['Kitchen Staff', 'Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId, itemId } = req.params;

    const orderRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId);

    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();
    const updatedItems = order.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'cooking',
          cookingStartedAt: new Date(),
        };
      }
      return item;
    });

    await orderRef.update({
      items: updatedItems,
      updatedAt: new Date(),
    });

    res.json({ message: 'Item cooking started' });
  } catch (error) {
    console.error('Start cooking error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Bump item to expo
router.post('/:orderId/items/:itemId/bump', authMiddleware, requireRole(['Kitchen Staff', 'Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId, itemId } = req.params;

    const orderRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId);

    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();
    const updatedItems = order.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status: 'bumped',
          bumpedAt: new Date(),
        };
      }
      return item;
    });

    await orderRef.update({
      items: updatedItems,
      updatedAt: new Date(),
    });

    // Add to expo screen
    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('expoScreen')
      .add({
        orderId,
        itemId,
        item: updatedItems.find(i => i.id === itemId),
        status: 'ready',
        bumpedAt: new Date(),
      });

    res.json({ message: 'Item bumped to expo' });
  } catch (error) {
    console.error('Bump item error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve order (mark as complete)
router.post('/:orderId/serve', authMiddleware, requireRole(['Front Staff', 'Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId } = req.params;

    const orderRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId);

    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await orderRef.update({
      status: 'served',
      servedAt: new Date(),
      updatedAt: new Date(),
    });

    // Archive the order
    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('archivedOrders')
      .doc(orderId)
      .set(orderDoc.data());

    res.json({ message: 'Order served and archived' });
  } catch (error) {
    console.error('Serve order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get kitchen screen orders
router.get('/kitchen/screen', authMiddleware, requireRole(['Kitchen Staff', 'Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .where('status', '==', 'active')
      .orderBy('createdAt', 'asc')
      .get();

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ orders });
  } catch (error) {
    console.error('Get kitchen screen error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get expo screen orders
router.get('/expo/screen', authMiddleware, requireRole(['Front Staff', 'Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('expoScreen')
      .orderBy('bumpedAt', 'asc')
      .get();

    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ items });
  } catch (error) {
    console.error('Get expo screen error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

