const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  price: { type: Number, required: true },
  propertyType: { type: String, required: true },
  rooms: { type: Number, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  dpe: { type: String, required: true },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  userEmail: { type: String, required: true },
  datePosted: { type: Date, default: Date.now },
  referenceNumber: { type: String, required: true },
  ip: { type: String, required: true }
});

const Property = mongoose.model('Property', propertySchema);

module.exports = { Property };
