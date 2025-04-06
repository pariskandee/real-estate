const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Property } = require('../models/Property');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  }
});
const upload = multer({ storage: storage });

// POST route to create a new property listing
router.post('/', upload.array('images', 3), async (req, res) => {
  try {
    const { price, propertyType, rooms, address, contact, dpe, description, userEmail } = req.body;
    const images = req.files.map((file) => file.path); // Get image file paths

    const newProperty = new Property({
      price,
      propertyType,
      rooms,
      address,
      contact,
      dpe,
      description,
      images,
      userEmail,
      datePosted: new Date(),
      referenceNumber: 'REF-' + Math.floor(Math.random() * 100000),
      ip: req.ip, // Capture the user IP
    });

    await newProperty.save();
    res.status(200).json({ message: 'Property posted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to post property' });
  }
});

module.exports = router;
