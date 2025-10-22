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

    // Create user document in users collection (with password)
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

    // Also create employee record in organization
    await db
      .collection('organizations')
      .doc(orgId)
      .collection('employees')
      .doc(userId)
      .set({
        id: userId,
        email,
        password, // Store in employee record too for organization context
        name,
        role: 'Manager',
        status: 'active',
        joinedAt: new Date(),
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

    // Find user by email in users collection
    const usersSnapshot = await db.collection('users').get();
    const userDoc = usersSnapshot.docs.find(doc => doc.data().email === email);

    if (!userDoc) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = userDoc.data();

    // Verify password
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify user has orgId (organization-based user)
    if (!user.orgId) {
      return res.status(401).json({ error: 'User not associated with any organization' });
    }

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

// Forgot Password - Send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const db = getDb();

    // Find user by email
    const usersSnapshot = await db.collection('users').get();
    const userDoc = usersSnapshot.docs.find(doc => doc.data().email === email);

    if (!userDoc) {
      // Don't reveal if email exists for security
      return res.json({ message: 'If email exists, reset link will be sent' });
    }

    const user = userDoc.data();

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, type: 'password-reset' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '1h' }
    );

    // Save reset token to database
    await db.collection('passwordResets').doc(user.id).set({
      userId: user.id,
      email: user.email,
      token: resetToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    // TODO: Send email with reset link
    console.log(`Password reset link for ${email}: ${resetToken}`);

    res.json({ message: 'If email exists, reset link will be sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// Reset Password - Verify token and update password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    } catch (error) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ error: 'Invalid token type' });
    }

    const db = getDb();

    // Check if reset token still exists and is valid
    const resetDoc = await db.collection('passwordResets').doc(decoded.userId).get();
    if (!resetDoc.exists) {
      return res.status(400).json({ error: 'Reset token not found' });
    }

    // Update user password
    await db.collection('users').doc(decoded.userId).update({
      password: newPassword, // In production, hash this!
      updatedAt: new Date(),
    });

    // Delete reset token
    await db.collection('passwordResets').doc(decoded.userId).delete();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Change Password - Authenticated user
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const { id: userId } = req.user;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    const db = getDb();

    // Get user
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userDoc.data();

    // Verify current password
    if (user.password !== currentPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Update password
    await db.collection('users').doc(userId).update({
      password: newPassword, // In production, hash this!
      updatedAt: new Date(),
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

module.exports = router;

