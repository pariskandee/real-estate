const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const Property = require('../models/Property');

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await admin.auth().getUser(req.user.uid);
    res.json({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Get user's properties
router.get('/:id/properties', authMiddleware, async (req, res) => {
  try {
    const properties = await Property.find({ postedBy: req.params.id });
    res.json(properties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin-only: Get all users
router.get('/', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await admin.auth().listUsers();
    res.json(users.users.map(user => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      customClaims: user.customClaims
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// Admin-only: Update user role
router.patch('/:id/role', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    await admin.auth().setCustomUserClaims(req.params.id, { 
      admin: role === 'admin' 
    });
    
    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;