const express = require('express');
const jwt = require('jsonwebtoken');
const { getDb, getAuth } = require('../config/firebase');
const { authMiddleware, requireRole } = require('../middleware/auth');
const { sendInviteEmail } = require('../services/emailService');

const router = express.Router();

// Generate next employee number
const generateEmployeeNumber = async (orgId) => {
  try {
    const snapshot = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('employees')
      .get();

    const numbers = snapshot.docs
      .map(doc => {
        const empNum = doc.data().employeeNumber;
        return empNum ? parseInt(empNum.replace(/\D/g, '')) : 0;
      })
      .filter(num => num > 0);

    const nextNum = Math.max(...numbers, 0) + 1;
    return `EMP${String(nextNum).padStart(5, '0')}`;
  } catch (error) {
    console.error('Error generating employee number:', error);
    return `EMP${String(Date.now()).slice(-5)}`;
  }
};

// Add new employee with invite
router.post('/add', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const {
      email,
      firstName,
      lastName,
      phoneNumber,
      address,
      emergencyContact,
      emergencyPhone,
      role = 'Kitchen Staff',
      expiresInDays = 7,
    } = req.body;

    // Validate required fields
    if (!email || !firstName || !lastName || !phoneNumber) {
      return res.status(400).json({
        error: 'Email, first name, last name, and phone number are required',
      });
    }

    // Check if user already exists
    const usersSnapshot = await getDb().collection('users').get();
    const existingUser = usersSnapshot.docs.find(doc => doc.data().email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate employee number
    const employeeNumber = await generateEmployeeNumber(orgId);

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

    const inviteData = {
      id: inviteRef.id,
      email,
      firstName,
      lastName,
      phoneNumber,
      address,
      emergencyContact,
      emergencyPhone,
      role,
      employeeNumber,
      token: inviteToken,
      status: 'pending',
      createdBy: req.user.id,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    };

    await inviteRef.set(inviteData);

    // Send invite email
    const inviteLink = `${process.env.WEB_URL || 'http://localhost:5173'}/invite?token=${inviteToken}`;
    const orgSnapshot = await getDb().collection('organizations').doc(orgId).get();
    const orgName = orgSnapshot.data()?.name || 'Our Restaurant';

    // Try to send email (don't fail if email service is not configured)
    try {
      await sendInviteEmail(email, inviteLink, orgName);
    } catch (emailError) {
      console.log('Email not sent (service not configured):', emailError.message);
    }

    res.status(201).json({
      id: inviteRef.id,
      message: 'Employee invite created successfully',
      employeeNumber,
      inviteLink,
      email,
      firstName,
      lastName,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    });
  } catch (error) {
    console.error('Add employee error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Invite employee (legacy)
router.post('/invite', requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { email, name, role } = req.body;

    if (!email || !name || !role) {
      return res.status(400).json({ error: 'Email, name, and role required' });
    }

    // Create invitation record
    const inviteRef = getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('invitations')
      .doc();

    const inviteCode = Math.random().toString(36).substring(2, 15);

    await inviteRef.set({
      email,
      name,
      role,
      inviteCode,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    res.status(201).json({
      message: 'Invitation sent successfully',
      inviteCode,
    });
  } catch (error) {
    console.error('Invite employee error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept invitation
router.post('/accept-invite', async (req, res) => {
  try {
    const { orgId, inviteCode, password } = req.body;

    if (!orgId || !inviteCode || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Find invitation
    const inviteQuery = await getDb()
      .collection('organizations')
      .doc(orgId)
      .collection('invitations')
      .where('inviteCode', '==', inviteCode)
      .limit(1)
      .get();

    if (inviteQuery.empty) {
      return res.status(404).json({ error: 'Invalid invitation code' });
    }

    const inviteDoc = inviteQuery.docs[0];
    const inviteData = inviteDoc.data();

    if (inviteData.status !== 'pending') {
      return res.status(400).json({ error: 'Invitation already used' });
    }

    if (new Date() > inviteData.expiresAt) {
      return res.status(400).json({ error: 'Invitation expired' });
    }

    // Create Firebase user
    const userRecord = await getAuth().createUser({
      email: inviteData.email,
      password,
      displayName: inviteData.name,
    });

    // Create user document
    await getDb().collection('users').doc(userRecord.uid).set({
      email: inviteData.email,
      name: inviteData.name,
      role: inviteData.role,
      orgId,
      createdAt: new Date(),
      status: 'active',
    });

    // Mark invitation as accepted
    await inviteDoc.ref.update({
      status: 'accepted',
      acceptedAt: new Date(),
      userId: userRecord.uid,
    });

    res.json({
      message: 'Invitation accepted successfully',
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error('Accept invite error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all employees
router.get('/', async (req, res) => {
  try {
    const { orgId } = req.user;

    const snapshot = await getDb()
      .collection('users')
      .where('orgId', '==', orgId)
      .get();

    const employees = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({ employees });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update employee role (PATCH)
router.patch('/:employeeId', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { employeeId } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: 'Role required' });
    }

    await getDb()
      .collection('users')
      .doc(employeeId)
      .update({
        role,
        updatedAt: new Date(),
      });

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update employee (PUT)
router.put('/:employeeId', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { employeeId } = req.params;
    const { name, email, phone, role, address, emergencyContact, emergencyPhone } = req.body;

    const updates = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (email !== undefined) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (role !== undefined) updates.role = role;
    if (address !== undefined) updates.address = address;
    if (emergencyContact !== undefined) updates.emergencyContact = emergencyContact;
    if (emergencyPhone !== undefined) updates.emergencyPhone = emergencyPhone;

    await getDb()
      .collection('users')
      .doc(employeeId)
      .update(updates);

    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:employeeId', authMiddleware, requireRole(['Manager']), async (req, res) => {
  try {
    const { orgId } = req.user;
    const { employeeId } = req.params;

    // Verify employee belongs to this organization
    const empDoc = await getDb().collection('users').doc(employeeId).get();
    if (!empDoc.exists || empDoc.data().orgId !== orgId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete employee
    await getDb().collection('users').doc(employeeId).delete();

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

