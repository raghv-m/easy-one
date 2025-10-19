const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Sign up - Create organization and user
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, organizationName } = req.body;

    if (!email || !password || !name || !organizationName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = getDb();

    // Check if user already exists by querying users collection
    const usersSnapshot = await db.collection('users').get();
    const existingUser = usersSnapshot.docs.find(doc => doc.data().email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user ID and org ID
    const userId = `user_${Date.now()}`;
    const orgId = `org_${Date.now()}`;

    // Create organization document
    await db.collection('organizations').doc(orgId).set({
      id: orgId,
      name: organizationName,
      createdAt: new Date(),
      createdBy: userId,
      status: 'active',
    });

    // Create user document
    await db.collection('users').doc(userId).set({
      id: userId,
      email,
      password, // In production, hash this!
      name,
      role: 'Manager', // First user is manager
      orgId,
      createdAt: new Date(),
      status: 'active',
    });

    // Create JWT token
    const token = jwt.sign(
      { userId, email, orgId, role: 'Manager', name },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Organization and user created successfully',
      token,
      user: {
        id: userId,
        email,
        name,
        role: 'Manager',
        orgId,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Login - Get JWT token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const db = getDb();

    // Find user by email
    const usersSnapshot = await db.collection('users').get();
    const userDoc = usersSnapshot.docs.find(doc => doc.data().email === email);

    if (!userDoc || userDoc.data().password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userDoc.data();

    // Create JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, orgId: user.orgId, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        orgId: user.orgId,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

