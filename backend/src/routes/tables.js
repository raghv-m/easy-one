const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Create table
router.post('/', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { tableNumber, seats, type, location } = req.body;

    if (!tableNumber || !seats) {
      return res.status(400).json({ error: 'Table number and seats required' });
    }

    // Check if table number already exists
    const existingSnapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tables')
      .where('tableNumber', '==', tableNumber)
      .get();

    if (!existingSnapshot.empty) {
      return res.status(400).json({ error: 'Table number already exists' });
    }

    const tableRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tables')
      .doc();

    const tableData = {
      id: tableRef.id,
      tableNumber,
      seats,
      type: type || 'indoor',
      location: location || '',
      status: 'available',
      assignedServer: null,
      openTime: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await tableRef.set(tableData);

    res.status(201).json({
      id: tableRef.id,
      message: 'Table created successfully',
      ...tableData,
    });
  } catch (error) {
    console.error('Create table error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all tables
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { status } = req.query;

    let query = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tables');

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.orderBy('tableNumber', 'asc').get();
    const tables = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ tables });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single table
router.get('/:tableId', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { tableId } = req.params;

    const doc = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tables')
      .doc(tableId)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Table not found' });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update table
router.patch('/:tableId', authMiddleware, requireRole(['Front Staff', 'Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { tableId } = req.params;
    const { status, assignedServer, seats, location, type } = req.body;

    const updates = { updatedAt: new Date() };
    if (status) updates.status = status;
    if (assignedServer) updates.assignedServer = assignedServer;
    if (seats) updates.seats = seats;
    if (location) updates.location = location;
    if (type) updates.type = type;
    if (status === 'occupied' && !updates.openTime) {
      updates.openTime = new Date();
    }

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tables')
      .doc(tableId)
      .update(updates);

    res.json({ message: 'Table updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete table
router.delete('/:tableId', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { tableId } = req.params;

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('tables')
      .doc(tableId)
      .delete();

    res.json({ message: 'Table deleted successfully' });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

