const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');  // Make sure this is installed
const { body, validationResult } = require('express-validator');

// Initialize Firebase Admin if not already done
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebase-service-account.json'))
  });
}

router.post('/verify', [
  body('token').notEmpty().withMessage('Token is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(req.body.token);
    res.json({ user: decodedToken });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;