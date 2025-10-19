const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get current punch status for employee
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId } = req.user;

    const db = getDb();
    const punchesRef = db.collection('organizations').doc(orgId).collection('punches');
    const snapshot = await punchesRef.where('employeeId', '==', userId).orderBy('punchInTime', 'desc').get();

    if (snapshot.empty) {
      return res.json({ status: 'out', currentPunch: null });
    }

    const latestPunch = snapshot.docs[0].data();
    const status = latestPunch.punchOutTime ? 'out' : 'in';

    res.json({
      status,
      currentPunch: latestPunch,
    });
  } catch (error) {
    console.error('Get punch status error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Punch in
router.post('/in', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId, name } = req.user;
    const db = getDb();

    // Check if employee already has active punch
    const punchesRef = db.collection('organizations').doc(orgId).collection('punches');
    const activeSnapshot = await punchesRef.where('employeeId', '==', userId).where('punchOutTime', '==', null).get();

    if (!activeSnapshot.empty) {
      return res.status(400).json({ error: 'Employee already punched in' });
    }

    // Check if employee has a shift today
    const shiftsRef = db.collection('organizations').doc(orgId).collection('shifts');
    const today = new Date().toISOString().split('T')[0];
    const shiftsSnapshot = await shiftsRef
      .where('employeeId', '==', userId)
      .where('date', '==', today)
      .get();

    if (shiftsSnapshot.empty) {
      return res.status(400).json({ error: 'No shift assigned for today' });
    }

    const shift = shiftsSnapshot.docs[0].data();
    const punchInTime = new Date();

    // Create punch record
    const punchId = `punch_${Date.now()}`;
    await punchesRef.doc(punchId).set({
      id: punchId,
      employeeId: userId,
      employeeName: name,
      shiftId: shift.id,
      punchInTime,
      punchOutTime: null,
      duration: null,
      createdAt: punchInTime,
    });

    res.status(201).json({
      message: 'Punched in successfully',
      punch: {
        id: punchId,
        punchInTime,
        status: 'in',
      },
    });
  } catch (error) {
    console.error('Punch in error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Punch out
router.post('/out', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId } = req.user;
    const db = getDb();

    // Find active punch
    const punchesRef = db.collection('organizations').doc(orgId).collection('punches');
    const activeSnapshot = await punchesRef.where('employeeId', '==', userId).where('punchOutTime', '==', null).get();

    if (activeSnapshot.empty) {
      return res.status(400).json({ error: 'No active punch found' });
    }

    const punchDoc = activeSnapshot.docs[0];
    const punch = punchDoc.data();
    const punchOutTime = new Date();

    // Calculate duration in minutes
    const duration = Math.round((punchOutTime - new Date(punch.punchInTime)) / 60000);

    // Update punch record
    await punchesRef.doc(punchDoc.id).update({
      punchOutTime,
      duration,
    });

    res.json({
      message: 'Punched out successfully',
      punch: {
        id: punchDoc.id,
        punchInTime: punch.punchInTime,
        punchOutTime,
        duration,
        status: 'out',
      },
    });
  } catch (error) {
    console.error('Punch out error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get punch history for employee
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId } = req.user;
    const { limit = 30 } = req.query;

    const db = getDb();
    const punchesRef = db.collection('organizations').doc(orgId).collection('punches');
    const snapshot = await punchesRef
      .where('employeeId', '==', userId)
      .orderBy('punchInTime', 'desc')
      .get();

    const punches = snapshot.docs.slice(0, parseInt(limit)).map(doc => doc.data());

    res.json({ punches });
  } catch (error) {
    console.error('Get punch history error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

