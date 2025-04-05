const express = require('express');
const router = express.Router();
const { Property } = require('../models/Property');

// Get all posts for admin to approve
router.get('/posts', async (req, res) => {
  try {
    const posts = await Property.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// Admin can approve or delete posts
router.put('/approve/:id', async (req, res) => {
  try {
    const post = await Property.findByIdAndUpdate(req.params.id, { approved: true });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve post' });
  }
});

module.exports = router;
