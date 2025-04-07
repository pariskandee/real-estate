const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  images: [String],
  type: String, // sale or rent
  price: Number,
  fullAddress: String,
  contact: String,
  dpe: String,
  propertyType: String,
  rooms: Number,
  size: Number,
  description: String,
  createdAt: { type: Date, default: Date.now },
  referenceId: String,
  userIp: String,
  userEmail: String,
  isApproved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Post', postSchema);
