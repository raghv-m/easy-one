const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create shift
router.post('/shifts', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { employeeId, role, startTime, endTime, recurring } = req.body;

    if (!employeeId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Employee ID, start time, and end time required' });
    }

    const shiftRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts')
      .doc();

    await shiftRef.set({
      employeeId,
      role,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'active',
      recurring: recurring || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      id: shiftRef.id,
      message: 'Shift created successfully',
    });
  } catch (error) {
    console.error('Create shift error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get shifts for employee
router.get('/employee/:employeeId', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { employeeId } = req.params;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts')
      .where('employeeId', '==', employeeId)
      .orderBy('startTime', 'asc')
      .get();

    const shifts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ shifts });
  } catch (error) {
    console.error('Get shifts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all shifts for organization
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { startDate, endDate } = req.query;

    let query = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts');

    if (startDate && endDate) {
      query = query
        .where('startTime', '>=', new Date(startDate))
        .where('startTime', '<=', new Date(endDate));
    }

    const snapshot = await query.orderBy('startTime', 'asc').get();
    const shifts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ shifts });
  } catch (error) {
    console.error('Get all shifts error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Request shift trade
router.post('/:shiftId/trade', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId } = req.user;
    const { shiftId } = req.params;
    const { targetEmployeeId } = req.body;

    if (!targetEmployeeId) {
      return res.status(400).json({ error: 'Target employee ID required' });
    }

    const tradeRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shiftTrades')
      .doc();

    await tradeRef.set({
      shiftId,
      requestedBy: userId,
      targetEmployee: targetEmployeeId,
      status: 'pending',
      createdAt: new Date(),
    });

    // TODO: Send email notification

    res.status(201).json({
      message: 'Trade request created successfully',
    });
  } catch (error) {
    console.error('Trade shift error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve/Deny trade
router.patch('/:tradeId/approve', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { tradeId } = req.params;
    const { approved } = req.body;

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shiftTrades')
      .doc(tradeId)
      .update({
        status: approved ? 'approved' : 'denied',
        approvedAt: new Date(),
      });

    res.json({ message: `Trade ${approved ? 'approved' : 'denied'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

