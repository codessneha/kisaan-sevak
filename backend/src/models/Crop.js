const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  firebaseUid:  { type: String, required: true, index: true },
  cropName:     { type: String, required: true },
  landSizeAcres:{ type: Number, default: 0 },
  soilType:     { type: String },
  irrigationMethod: { type: String },
  season: { type: String, enum: ['kharif','rabi','zaid'] },
  sowingDate: { type: Date },
  location:   { lat: Number, lng: Number },
  // AI Predictions
  predictedYieldKgPerAcre: { type: Number },
  yieldCategory:    { type: String },
  climateScore:     { type: Number },
  soilHealthScore:  { type: Number },
  advisory:         { type: String },
  weatherRisk:      { type: String, enum: ['low','medium','high'] },
  suggestedCrops:   [{ cropName: String, predictedYieldKgPerHa: Number }],
  status: { type: String, default: 'Predicted' },
}, { timestamps: true });

module.exports = mongoose.model('Crop', CropSchema);
