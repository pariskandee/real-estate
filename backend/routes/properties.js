const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const requestIp = require('request-ip');
const { body, validationResult } = require('express-validator');
const Property = require('../models/Property');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads/properties');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed!'), false);
    }
  }
}).array('images', 3); // Max 3 images

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware imports (ensure these files exist)
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// Utility function for handling errors
const handleError = (res, err, status = 500) => {
  console.error(err);
  res.status(status).json({ 
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

// Get all approved properties
router.get('/', async (req, res) => {
  try {
    const { 
      transactionType, 
      propertyType, 
      minPrice, 
      maxPrice, 
      minRooms, 
      location,
      page = 1,
      limit = 12
    } = req.query;
    
    const query = { isApproved: true };
    
    if (transactionType) query.transactionType = transactionType;
    if (propertyType) query.propertyType = propertyType;
    if (minPrice) query.price = { $gte: Number(minPrice) };
    if (maxPrice) query.price = { ...(query.price || {}), $lte: Number(maxPrice) };
    if (minRooms) query.rooms = { $gte: Number(minRooms) };
    
    const skip = (page - 1) * limit;
    
    const [properties, total] = await Promise.all([
      Property.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 }),
      Property.countDocuments(query)
    ]);
    
    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    handleError(res, err);
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.json(property);
  } catch (err) {
    handleError(res, err);
  }
});

// Add new property (protected)
router.post(
  '/',
  authMiddleware,
  upload,
  [
    body('title').notEmpty().trim().withMessage('Title is required'),
    body('description').notEmpty().trim().withMessage('Description is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('propertyType').isIn(['house', 'apartment', 'land', 'commercial']).withMessage('Invalid property type'),
    body('transactionType').isIn(['sale', 'rent']).withMessage('Invalid transaction type'),
    body('rooms').isInt({ min: 1 }).withMessage('Rooms must be at least 1'),
    body('bedrooms').isInt({ min: 0 }).withMessage('Bedrooms cannot be negative'),
    body('bathrooms').isInt({ min: 0 }).withMessage('Bathrooms cannot be negative'),
    body('surface').isInt({ min: 1 }).withMessage('Surface must be at least 1'),
    body('dpe').isIn(['A', 'B', 'C', 'D', 'E', 'F', 'G']).withMessage('Invalid DPE value'),
    body('address.street').notEmpty().trim().withMessage('Street is required'),
    body('address.city').notEmpty().trim().withMessage('City is required'),
    body('address.postalCode').notEmpty().trim().withMessage('Postal code is required'),
    body('contact.name').notEmpty().trim().withMessage('Contact name is required'),
    body('contact.phone').notEmpty().trim().withMessage('Contact phone is required'),
    body('contact.email').isEmail().normalizeEmail().withMessage('Invalid email address')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // Clean up uploaded files if validation fails
        if (req.files && req.files.length > 0) {
          await Promise.all(req.files.map(file => 
            fs.promises.unlink(file.path).catch(console.error)
          ));
        }
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.files || req.files.length < 1) {
        return res.status(400).json({ message: 'At least 1 image is required' });
      }

      // Upload images to Cloudinary
      const uploadResults = await Promise.all(
        req.files.map(file => 
          cloudinary.uploader.upload(file.path, {
            folder: 'real-estate',
            transformation: { width: 800, height: 600, crop: 'fill' }
          })
        )
      );

      // Clean up local files after Cloudinary upload
      await Promise.all(req.files.map(file => 
        fs.promises.unlink(file.path).catch(console.error)
      ));

      const imageUrls = uploadResults.map(result => result.secure_url);
      
      // Generate reference number
      const count = await Property.countDocuments();
      const reference = `PROP-${(count + 1).toString().padStart(6, '0')}`;
      
      const property = new Property({
        ...req.body,
        images: imageUrls,
        postedBy: req.user.uid, // Changed from req.user.id to req.user.uid
        userIp: requestIp.getClientIp(req),
        reference,
        location: {
          type: 'Point',
          coordinates: req.body.coordinates || [0, 0]
        }
      });
      
      await property.save();
      res.status(201).json(property);
    } catch (err) {
      // Clean up any uploaded files if error occurs
      if (req.files && req.files.length > 0) {
        await Promise.all(req.files.map(file => 
          fs.promises.unlink(file.path).catch(console.error)
        ));
      }
      handleError(res, err);
    }
  }
);

// Admin-only routes
const adminRoutes = ['approve', 'delete', 'admin/list'];
adminRoutes.forEach(route => {
  router.use(`/${route}`, adminMiddleware);
});

// Approve property
router.patch('/:id/approve', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    property.isApproved = true;
    await property.save();
    
    res.json(property);
  } catch (err) {
    handleError(res, err);
  }
});

// Delete property
router.delete('/:id', async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    // Delete images from Cloudinary
    await Promise.all(
      property.images.map(image => {
        const publicId = image.split('/').pop().split('.')[0];
        return cloudinary.uploader.destroy(`real-estate/${publicId}`);
      })
    );
    
    res.json({ message: 'Property deleted successfully' });
  } catch (err) {
    handleError(res, err);
  }
});

// Admin property list
router.get('/admin/list', async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.postalCode': { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [properties, total] = await Promise.all([
      Property.find(query)
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 })
        .populate('postedBy', 'email'),
      Property.countDocuments(query)
    ]);
    
    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page)
    });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;