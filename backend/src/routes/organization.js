const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get organization settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;

    const doc = await getDb().collection('organizations').doc(orgId).get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update organization settings
router.put('/settings', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { name, address, phone, email, cuisine, description, logo, theme } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Organization name required' });
    }

    const orgRef = getDb().collection('organizations').doc(orgId);

    await orgRef.update({
      name,
      address: address || '',
      phone: phone || '',
      email: email || '',
      cuisine: cuisine || '',
      description: description || '',
      logo: logo || '',
      theme: theme || 'dark',
      updatedAt: new Date(),
    });

    const updatedDoc = await orgRef.get();

    res.json({
      message: 'Organization settings updated successfully',
      ...updatedDoc.data(),
    });
  } catch (error) {
    console.error('Update organization error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get table arrangements
router.get('/tables/arrangements', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tableArrangements')
      .get();

    const arrangements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ arrangements });
  } catch (error) {
    console.error('Get table arrangements error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save table arrangements
router.post('/tables/arrangements', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { layout, tables } = req.body;

    if (!layout || !tables) {
      return res.status(400).json({ error: 'Layout and tables required' });
    }

    const arrangementRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tableArrangements')
      .doc('current');

    await arrangementRef.set({
      layout,
      tables,
      updatedAt: new Date(),
      updatedBy: req.user.uid,
    });

    res.json({
      message: 'Table arrangements saved successfully',
      layout,
      tables,
    });
  } catch (error) {
    console.error('Save table arrangements error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get order analytics
router.get('/analytics/orders', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { startDate, endDate } = req.query;

    let query = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders');

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      query = query
        .where('createdAt', '>=', start)
        .where('createdAt', '<=', end);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate analytics
    const analytics = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => {
        const itemsTotal = order.items.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
        return sum + itemsTotal - (order.discountAmount || 0);
      }, 0),
      averageOrderValue: 0,
      ordersByServer: {},
      ordersByDate: {},
      averagePrepTime: 0,
    };

    if (orders.length > 0) {
      analytics.averageOrderValue = analytics.totalRevenue / orders.length;

      // Group by server
      orders.forEach(order => {
        const serverName = order.serverName || 'Unknown';
        if (!analytics.ordersByServer[serverName]) {
          analytics.ordersByServer[serverName] = {
            count: 0,
            revenue: 0,
            avgPrepTime: 0,
          };
        }
        const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        analytics.ordersByServer[serverName].count += 1;
        analytics.ordersByServer[serverName].revenue += itemsTotal - (order.discountAmount || 0);
      });

      // Group by date
      orders.forEach(order => {
        const date = new Date(order.createdAt).toLocaleDateString();
        if (!analytics.ordersByDate[date]) {
          analytics.ordersByDate[date] = {
            count: 0,
            revenue: 0,
          };
        }
        const itemsTotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        analytics.ordersByDate[date].count += 1;
        analytics.ordersByDate[date].revenue += itemsTotal - (order.discountAmount || 0);
      });

      // Calculate average prep time
      const prepTimes = orders
        .filter(o => o.prepTime)
        .map(o => o.prepTime);
      if (prepTimes.length > 0) {
        analytics.averagePrepTime = prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length;
      }
    }

    res.json({
      orders,
      analytics,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

