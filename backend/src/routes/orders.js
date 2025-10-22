const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      tableId,
      tableNumber,
      items,
      discountAmount,
      notes,
      guestName,
      guestCount,
      allergies,
      specialInstructions,
    } = req.body;
    const { orgId, id, name } = req.user;

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

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    await orderRef.set({
      orderId,
      tableId,
      tableNumber: tableNumber || 'Unknown',
      guestName: guestName || 'Guest',
      guestCount: guestCount || 1,
      items,
      itemsByCategory,
      discountAmount: discountAmount || 0,
      notes: notes || '',
      allergies: allergies || '',
      specialInstructions: specialInstructions || '',
      totalAmount,
      status: 'active',
      serverName: name || 'Unknown',
      createdBy: id,
      createdAt: now,
      updatedAt: now,
      prepTime: 0, // Will be calculated when order is completed
    });

    // Update table status to occupied
    if (tableId) {
      await getDb()
        .collection('organizations')
        .doc(orgId)
        .collection('tables')
        .doc(tableId)
        .update({
          status: 'occupied',
          occupiedAt: now,
          currentOrderId: orderId,
          updatedAt: now,
        })
        .catch(err => console.log('Table update note:', err.message)); // Don't fail if table doesn't exist
    }

    // Create kitchen screen entries for each category
    for (const [category, categoryItems] of Object.entries(itemsByCategory)) {
      await getDb()
        .collection('organizations')
        .doc(orgId)
        .collection('kitchenScreens')
        .add({
          orderId,
          tableId,
          tableNumber: tableNumber || 'Unknown',
          guestName: guestName || 'Guest',
          category,
          items: categoryItems,
          allergies: allergies || '',
          specialInstructions: specialInstructions || '',
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

// Fire item (mark as ready to move to next station)
router.post('/:orderId/items/:itemId/fire', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId, itemId } = req.params;
    const { station } = req.body;

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
          status: 'fired',
          firedAt: new Date(),
          firedFromStation: station,
        };
      }
      return item;
    });

    await orderRef.update({
      items: updatedItems,
      updatedAt: new Date(),
    });

    res.json({ message: 'Item fired' });
  } catch (error) {
    console.error('Fire item error:', error);
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

    const order = orderDoc.data();
    const servedAt = new Date();

    // Calculate prep time in minutes
    const prepTime = Math.round((servedAt - order.createdAt) / 60000);

    await orderRef.update({
      status: 'served',
      servedAt,
      prepTime,
      updatedAt: servedAt,
    });

    // Archive the order with all details
    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('archivedOrders')
      .doc(orderId)
      .set({
        ...order,
        status: 'served',
        servedAt,
        prepTime,
        updatedAt: servedAt,
      });

    res.json({
      message: 'Order served and archived',
      prepTime,
    });
  } catch (error) {
    console.error('Serve order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get orders for specific station
router.get('/station/:station', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { station } = req.params;

    // Get all active orders (without orderBy to avoid index requirement)
    const ordersSnapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .where('status', '==', 'active')
      .get();

    // Get all menu items to check components
    const menusSnapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .get();

    const menuMap = {};
    menusSnapshot.docs.forEach(doc => {
      const menu = doc.data();
      menuMap[menu.name] = menu;
    });

    // Filter orders and items by station
    const orders = ordersSnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))
      .map(order => {
        // Filter items that have components for this station
        const filteredItems = order.items?.filter(item => {
          const menuItem = menuMap[item.name];
          if (!menuItem || !menuItem.components) return false;
          return menuItem.components.some(comp => comp.station === station);
        }) || [];

        return {
          ...order,
          items: filteredItems.map(item => ({
            ...item,
            id: item.id || `${order.id}-${item.name}`,
          })),
        };
      })
      .filter(order => order.items.length > 0); // Only return orders with items for this station

    res.json({ orders });
  } catch (error) {
    console.error('Get station orders error:', error);
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

// Update order (PUT)
router.put('/:orderId', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId } = req.params;
    const { status, guestName, guestCount, specialInstructions, allergies, notes } = req.body;

    const updates = { updatedAt: new Date() };
    if (status !== undefined) updates.status = status;
    if (guestName !== undefined) updates.guestName = guestName;
    if (guestCount !== undefined) updates.guestCount = guestCount;
    if (specialInstructions !== undefined) updates.specialInstructions = specialInstructions;
    if (allergies !== undefined) updates.allergies = allergies;
    if (notes !== undefined) updates.notes = notes;

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId)
      .update(updates);

    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete order
router.delete('/:orderId', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { orderId } = req.params;

    // Get order to find table
    const orderDoc = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId)
      .get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order = orderDoc.data();

    // Delete order
    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .doc(orderId)
      .delete();

    // Update table status back to available if it was occupied by this order
    if (order.tableId && order.status === 'active') {
      await getDb()
        .collection('organizations')
        .doc(orgId)
        .collection('tables')
        .doc(order.tableId)
        .update({
          status: 'available',
          updatedAt: new Date(),
        })
        .catch(err => console.log('Table update note:', err.message));
    }

    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

