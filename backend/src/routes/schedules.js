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

    const tradeRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shiftTrades')
      .doc(tradeId);

    const tradeDoc = await tradeRef.get();
    if (!tradeDoc.exists) {
      return res.status(404).json({ error: 'Trade request not found' });
    }

    const trade = tradeDoc.data();

    if (approved) {
      // Swap the shifts
      const shiftRef = getDb()
        .collection('organizations')
        .doc(orgId)
        .collection('shifts')
        .doc(trade.shiftId);

      await shiftRef.update({
        employeeId: trade.targetEmployee,
        updatedAt: new Date(),
      });
    }

    await tradeRef.update({
      status: approved ? 'approved' : 'denied',
      approvedAt: new Date(),
    });

    res.json({ message: `Trade ${approved ? 'approved' : 'denied'} successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Drop Shift - Employee drops a shift
router.post('/:shiftId/drop', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId } = req.user;
    const { shiftId } = req.params;

    const shiftRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts')
      .doc(shiftId);

    const shiftDoc = await shiftRef.get();
    if (!shiftDoc.exists) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const shift = shiftDoc.data();

    // Verify employee owns this shift
    if (shift.employeeId !== userId) {
      return res.status(403).json({ error: 'You can only drop your own shifts' });
    }

    // Create drop request
    const dropRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shiftDrops')
      .doc();

    await dropRef.set({
      shiftId,
      employeeId: userId,
      status: 'pending',
      createdAt: new Date(),
    });

    res.status(201).json({
      id: dropRef.id,
      message: 'Shift drop request created successfully',
    });
  } catch (error) {
    console.error('Drop shift error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Approve Drop Shift - Manager approves
router.patch('/:dropId/approve-drop', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { dropId } = req.params;

    const dropRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shiftDrops')
      .doc(dropId);

    const dropDoc = await dropRef.get();
    if (!dropDoc.exists) {
      return res.status(404).json({ error: 'Drop request not found' });
    }

    const drop = dropDoc.data();

    // Mark shift as available
    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts')
      .doc(drop.shiftId)
      .update({
        employeeId: null,
        status: 'available',
        updatedAt: new Date(),
      });

    await dropRef.update({
      status: 'approved',
      approvedAt: new Date(),
    });

    res.json({ message: 'Shift drop approved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Pick Up Shift - Employee picks up available shift
router.post('/:shiftId/pickup', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId } = req.user;
    const { shiftId } = req.params;

    const shiftRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts')
      .doc(shiftId);

    const shiftDoc = await shiftRef.get();
    if (!shiftDoc.exists) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    const shift = shiftDoc.data();

    // Check if shift is available
    if (shift.status !== 'available' || shift.employeeId !== null) {
      return res.status(400).json({ error: 'Shift is not available' });
    }

    // Assign shift to employee
    await shiftRef.update({
      employeeId: userId,
      status: 'active',
      updatedAt: new Date(),
    });

    res.json({ message: 'Shift picked up successfully' });
  } catch (error) {
    console.error('Pick up shift error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available shifts
router.get('/available/list', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { startDate, endDate } = req.query;

    let query = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('shifts')
      .where('status', '==', 'available')
      .where('employeeId', '==', null);

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
    console.error('Get available shifts error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

