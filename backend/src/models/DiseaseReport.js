const mongoose = require('mongoose');

const DiseaseReportSchema = new mongoose.Schema({
  firebaseUid:  { type: String, required: true, index: true },
  cropName:     { type: String, required: true },
  diseaseName:  { type: String },
  severity:     { type: String, enum: ['mild','moderate','severe'] },
  symptoms:     { type: String },
  aiDiagnosis:  { type: String },
  treatment:    { type: String },
  imageBase64:  { type: String }, // optional uploaded image
  resolved:     { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('DiseaseReport', DiseaseReportSchema);
