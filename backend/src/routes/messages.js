const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Send message
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId, name } = req.user;
    const { text, channel = 'General' } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Message text required' });
    }

    const messageRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('messages')
      .doc();

    const now = new Date();

    await messageRef.set({
      id: messageRef.id,
      text: text.trim(),
      channel,
      senderId: userId,
      senderName: name,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({
      id: messageRef.id,
      message: 'Message sent successfully',
      data: {
        id: messageRef.id,
        text: text.trim(),
        channel,
        senderId: userId,
        senderName: name,
        createdAt: now,
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get messages for channel
router.get('/channel/:channel', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { channel } = req.params;
    const { limit = 50 } = req.query;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('messages')
      .where('channel', '==', channel)
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs
      .slice(0, parseInt(limit))
      .reverse()
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all messages
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { limit = 100 } = req.query;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .get();

    const messages = snapshot.docs
      .slice(0, parseInt(limit))
      .reverse()
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

    res.json({ messages });
  } catch (error) {
    console.error('Get all messages error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available channels
router.get('/channels/list', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('messages')
      .get();

    const channels = [...new Set(snapshot.docs.map(doc => doc.data().channel))];
    const defaultChannels = ['General', 'Kitchen', 'Management'];
    const allChannels = [...new Set([...defaultChannels, ...channels])];

    res.json({ channels: allChannels });
  } catch (error) {
    console.error('Get channels error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete message (only sender or admin)
router.delete('/:messageId', authMiddleware, async (req, res) => {
  try {
    const { orgId, id: userId, role } = req.user;
    const { messageId } = req.params;

    const messageRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('messages')
      .doc(messageId);

    const messageDoc = await messageRef.get();
    if (!messageDoc.exists) {
      return res.status(404).json({ error: 'Message not found' });
    }

    const message = messageDoc.data();
    if (message.senderId !== userId && role !== 'Manager') {
      return res.status(403).json({ error: 'Not authorized to delete this message' });
    }

    await messageRef.delete();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

