const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all users in organization
router.get('/organization/:orgId', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { orgId: userOrgId } = req.user;

    // Verify user belongs to this organization
    if (userOrgId !== orgId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const db = getDb();

    // Get all users from users collection that belong to this organization
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs
      .map(doc => doc.data())
      .filter(user => user.orgId === orgId)
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationName: user.organizationName,
        orgId: user.orgId,
        status: user.status,
        createdAt: user.createdAt,
      }));

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all users in current user's organization
router.get('/my-organization', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const db = getDb();

    // Get all users from users collection that belong to this organization
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs
      .map(doc => doc.data())
      .filter(user => user.orgId === orgId)
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationName: user.organizationName,
        orgId: user.orgId,
        status: user.status,
        createdAt: user.createdAt,
      }));

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all menu items in organization
router.get('/organization/:orgId/menu-items', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { orgId: userOrgId } = req.user;

    // Verify user belongs to this organization
    if (userOrgId !== orgId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const db = getDb();

    // Get all menu items from organization
    const menusSnapshot = await db
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .get();

    const menuItems = menusSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get all menu items in current user's organization
router.get('/my-organization/menu-items', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const db = getDb();

    // Get all menu items from organization
    const menusSnapshot = await db
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .get();

    const menuItems = menusSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: menuItems.length,
      menuItems,
    });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Get all users and menu items in organization
router.get('/organization/:orgId/all', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { orgId: userOrgId } = req.user;

    // Verify user belongs to this organization
    if (userOrgId !== orgId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const db = getDb();

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs
      .map(doc => doc.data())
      .filter(user => user.orgId === orgId)
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationName: user.organizationName,
        orgId: user.orgId,
        status: user.status,
        createdAt: user.createdAt,
      }));

    // Get all menu items
    const menusSnapshot = await db
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .get();

    const menuItems = menusSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: {
        users: {
          count: users.length,
          items: users,
        },
        menuItems: {
          count: menuItems.length,
          items: menuItems,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching organization data:', error);
    res.status(500).json({ error: 'Failed to fetch organization data' });
  }
});

// Get all users and menu items in current user's organization
router.get('/my-organization/all', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const db = getDb();

    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs
      .map(doc => doc.data())
      .filter(user => user.orgId === orgId)
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organizationName: user.organizationName,
        orgId: user.orgId,
        status: user.status,
        createdAt: user.createdAt,
      }));

    // Get all menu items
    const menusSnapshot = await db
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .get();

    const menuItems = menusSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      data: {
        users: {
          count: users.length,
          items: users,
        },
        menuItems: {
          count: menuItems.length,
          items: menuItems,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching organization data:', error);
    res.status(500).json({ error: 'Failed to fetch organization data' });
  }
});

module.exports = router;

