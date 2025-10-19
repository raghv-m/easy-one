const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate invite token
router.post('/generate', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { email, role, expiresInDays = 7 } = req.body;

    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role required' });
    }

    // Check if user already exists
    const usersSnapshot = await getDb().collection('users').get();
    const existingUser = usersSnapshot.docs.find(doc => doc.data().email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create invite token
    const inviteToken = jwt.sign(
      {
        email,
        role,
        orgId,
        type: 'invite',
      },
      process.env.JWT_SECRET,
      { expiresIn: `${expiresInDays}d` }
    );

    // Store invite in database
    const inviteRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('invites')
      .doc();

    await inviteRef.set({
      id: inviteRef.id,
      email,
      role,
      token: inviteToken,
      status: 'pending',
      createdBy: req.user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    });

    // TODO: Send email with invite link
    const inviteLink = `${process.env.WEB_URL || 'http://localhost:5173'}/invite?token=${inviteToken}`;

    res.status(201).json({
      id: inviteRef.id,
      message: 'Invite generated successfully',
      inviteLink,
      email,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Generate invite error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept invite and create user
router.post('/accept', async (req, res) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({ error: 'Token, name, and password required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired invite token' });
    }

    if (decoded.type !== 'invite') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    const { email, role, orgId } = decoded;

    // Check if user already exists
    const usersSnapshot = await getDb().collection('users').get();
    const existingUser = usersSnapshot.docs.find(doc => doc.data().email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const userId = `user_${Date.now()}`;
    const db = getDb();

    await db.collection('users').doc(userId).set({
      id: userId,
      email,
      name,
      password, // In production, hash this!
      role,
      orgId,
      createdAt: new Date(),
    });

    // Add user to organization
    await db
      .collection('organizations')
      .doc(orgId)
      .collection('employees')
      .doc(userId)
      .set({
        id: userId,
        email,
        name,
        role,
        status: 'active',
        joinedAt: new Date(),
      });

    // Mark invite as accepted
    const invitesSnapshot = await db
      .collection('organizations')
      .doc(orgId)
      .collection('invites')
      .where('email', '==', email)
      .get();

    if (!invitesSnapshot.empty) {
      await db
        .collection('organizations')
        .doc(orgId)
        .collection('invites')
        .doc(invitesSnapshot.docs[0].id)
        .update({
          status: 'accepted',
          acceptedAt: new Date(),
        });
    }

    // Create JWT token for login
    const loginToken = jwt.sign(
      {
        userId,
        email,
        orgId,
        role,
        name,
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Invite accepted and user created successfully',
      token: loginToken,
      user: {
        id: userId,
        email,
        name,
        role,
        orgId,
      },
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get pending invites for organization
router.get('/pending', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('invites')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get();

    const invites = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        role: data.role,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
        status: data.status,
      };
    });

    res.json({ invites });
  } catch (error) {
    console.error('Get pending invites error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Revoke invite
router.post('/:inviteId/revoke', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { inviteId } = req.params;

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('invites')
      .doc(inviteId)
      .update({
        status: 'revoked',
        revokedAt: new Date(),
      });

    res.json({ message: 'Invite revoked successfully' });
  } catch (error) {
    console.error('Revoke invite error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

