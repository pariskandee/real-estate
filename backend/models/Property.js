const mongoose = require('mongoose');
const { Schema } = mongoose;

const propertySchema = new Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'land', 'commercial'],
    required: [true, 'Property type is required']
  },
  transactionType: {
    type: String,
    enum: ['sale', 'rent'],
    required: [true, 'Transaction type is required']
  },
  rooms: {
    type: Number,
    required: [true, 'Number of rooms is required'],
    min: [1, 'Must have at least 1 room']
  },
  bedrooms: {
    type: Number,
    required: [true, 'Number of bedrooms is required'],
    min: [0, 'Bedrooms cannot be negative']
  },
  bathrooms: {
    type: Number,
    required: [true, 'Number of bathrooms is required'],
    min: [0, 'Bathrooms cannot be negative']
  },
  surface: {
    type: Number,
    required: [true, 'Surface area is required'],
    min: [1, 'Surface must be at least 1m²']
  },
  dpe: {
    type: String,
    enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    required: [true, 'Energy rating is required']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required']
    },
    country: {
      type: String,
      default: 'France'
    }
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: [true, 'Coordinates are required'],
      validate: {
        validator: function(v) {
          return v.length === 2;
        },
        message: 'Coordinates must be an array of [longitude, latitude]'
      }
    }
  },
  images: {
    type: [String],
    required: [true, 'At least one image is required'],
    validate: {
      validator: function(v) {
        return v.length >= 1 && v.length <= 10;
      },
      message: 'You must provide between 1 and 10 images'
    }
  },
  contact: {
    name: {
      type: String,
      required: [true, 'Contact name is required']
    },
    phone: {
      type: String,
      required: [true, 'Contact phone is required']
    },
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    }
  },
  features: [String],
  isApproved: {
    type: Boolean,
    default: false
  },
  reference: {
    type: String,
    unique: true
  },
  postedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userIp: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add 2dsphere index for geospatial queries
propertySchema.index({ location: '2dsphere' });

// Update the updatedAt field before saving
propertySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-generate reference number before saving
propertySchema.pre('save', async function(next) {
  if (!this.reference) {
    const count = await this.constructor.countDocuments();
    this.reference = `PROP-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Delete images from storage when property is removed
propertySchema.pre('remove', async function(next) {
  try {
    // If using Cloudinary
    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const cloudinary = require('cloudinary').v2;
      for (const imageUrl of this.images) {
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`real-estate/${publicId}`);
      }
    }
    // If using local storage
    else {
      const fs = require('fs');
      const path = require('path');
      for (const imagePath of this.images) {
        const fullPath = path.join(__dirname, '..', imagePath);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Property', propertySchema);