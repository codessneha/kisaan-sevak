const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, required: true, unique: true, index: true },
  name:        { type: String, required: true },
  phone:       { type: String, required: true },
  email:       { type: String },
  language: {
    type: String,
    enum: ['hi', 'en', 'bn', 'ta', 'te', 'mr', 'gu', 'pa'],
    default: 'hi',
  },
  location: {
    state:     String,
    district:  String,
    village:   String,
    latitude:  Number,
    longitude: Number,
  },
  landSizeAcres: { type: Number, default: 0 },
  primaryCrop:   String,
  soilType:      { type: String, enum: ['clay', 'loam', 'sandy', 'silt', 'black', 'red', 'alluvial', 'other'] },
  adharNumber:   String,
  bankAccountNo: String,
  ifscCode:      String,
  profileComplete: { type: Boolean, default: false },
  isActive:        { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
