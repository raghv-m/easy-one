const express = require('express');
const { getDb } = require('../config/firebase');

const router = express.Router();

// Get order statistics
router.get('/orders', async (req, res) => {
  try {
    const { orgId } = req.user;
    const { startDate, endDate } = req.query;

    let query = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders');

    if (startDate && endDate) {
      query = query
        .where('createdAt', '>=', new Date(startDate))
        .where('createdAt', '<=', new Date(endDate));
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map(doc => doc.data());

    // Calculate statistics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const itemsTotal = order.items.reduce((s, item) => s + (item.price * item.quantity || 0), 0);
      return sum + itemsTotal - (order.discountAmount || 0);
    }, 0);

    // Top selling items
    const itemCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + (item.quantity || 1);
      });
    });

    const topItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    res.json({
      totalOrders,
      totalRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      topItems,
    });
  } catch (error) {
    console.error('Get order analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get prep time statistics
router.get('/prep-times', async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('orders')
      .get();

    const orders = snapshot.docs.map(doc => doc.data());

    // Calculate average prep time by category
    const categoryStats = {};

    orders.forEach(order => {
      if (order.itemsByCategory) {
        Object.entries(order.itemsByCategory).forEach(([category, items]) => {
          if (!categoryStats[category]) {
            categoryStats[category] = { total: 0, count: 0 };
          }
          items.forEach(item => {
            if (item.completedAt && item.createdAt) {
              const prepTime = (item.completedAt - item.createdAt) / 1000 / 60; // minutes
              categoryStats[category].total += prepTime;
              categoryStats[category].count += 1;
            }
          });
        });
      }
    });

    const stats = Object.entries(categoryStats).map(([category, data]) => ({
      category,
      avgPrepTime: data.count > 0 ? (data.total / data.count).toFixed(2) : 0,
      itemsCompleted: data.count,
    }));

    res.json({ stats });
  } catch (error) {
    console.error('Get prep time analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get employee statistics
router.get('/employees', async (req, res) => {
  try {
    const { orgId } = req.user;

    const employeesSnapshot = await getDb()
      .collection('users')
      .where('orgId', '==', orgId)
      .get();

    const shiftsSnapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts')
      .get();

    const employees = employeesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const shifts = shiftsSnapshot.docs.map(doc => doc.data());

    // Calculate hours per employee
    const employeeStats = employees.map(emp => {
      const empShifts = shifts.filter(s => s.employeeId === emp.id);
      const totalHours = empShifts.reduce((sum, shift) => {
        const hours = (new Date(shift.endTime) - new Date(shift.startTime)) / 1000 / 60 / 60;
        return sum + hours;
      }, 0);

      return {
        id: emp.id,
        name: emp.name,
        role: emp.role,
        totalHours: totalHours.toFixed(2),
        shiftsCount: empShifts.length,
      };
    });

    res.json({ employees: employeeStats });
  } catch (error) {
    console.error('Get employee analytics error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

