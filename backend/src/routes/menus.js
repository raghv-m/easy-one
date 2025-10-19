const express = require('express');
const { getDb } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { sendMenuItemNotificationEmail } = require('../services/emailService');

const router = express.Router();

// Create menu item with recipe components
router.post('/', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { name, description, price, category, components, modifiers, allergens, image, notifyEmployees = true } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({ error: 'Name, price, and category required' });
    }

    const itemRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .doc();

    const menuItem = {
      id: itemRef.id,
      name,
      description: description || '',
      price,
      category,
      components: components || [], // Array of {name, station, quantity}
      modifiers: modifiers || [],
      allergens: allergens || [],
      image: image || '',
      available: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await itemRef.set(menuItem);

    // Send email notifications to all employees if enabled
    if (notifyEmployees) {
      try {
        const employeesSnapshot = await getDb()
          .collection('organizations')
          .doc(orgId)
          .collection('employees')
          .get();

        const orgSnapshot = await getDb().collection('organizations').doc(orgId).get();
        const orgName = orgSnapshot.data()?.name || 'Our Restaurant';

        // Send emails to all employees
        employeesSnapshot.docs.forEach(doc => {
          const employee = doc.data();
          if (employee.email) {
            sendMenuItemNotificationEmail(
              employee.email,
              employee.name || employee.firstName + ' ' + employee.lastName,
              menuItem,
              orgName
            ).catch(err => console.log('Email notification failed:', err.message));
          }
        });
      } catch (emailError) {
        console.log('Error sending menu notifications:', emailError.message);
      }
    }

    res.status(201).json({
      id: itemRef.id,
      message: 'Menu item created successfully',
      ...menuItem,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all menu items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { category } = req.query;

    let query = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('menus');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ items });
  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single menu item
router.get('/:itemId', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;
    const { itemId } = req.params;

    const doc = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .doc(itemId)
      .get();

    if (!doc.exists) {
      return res.status(404).json({ error: 'Menu item not found' });
    }

    res.json({
      id: doc.id,
      ...doc.data(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update menu item
router.patch('/:itemId', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { itemId } = req.params;
    const updates = req.body;

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .doc(itemId)
      .update({
        ...updates,
        updatedAt: new Date(),
      });

    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete menu item
router.delete('/:itemId', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { itemId } = req.params;

    await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .doc(itemId)
      .delete();

    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get menu categories
router.get('/categories/list', authMiddleware, async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('menus')
      .get();

    const categories = [...new Set(snapshot.docs.map(doc => doc.data().category))];

    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

