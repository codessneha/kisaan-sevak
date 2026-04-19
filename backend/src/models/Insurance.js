const mongoose = require('mongoose');

const InsuranceSchema = new mongoose.Schema({
  firebaseUid:  { type: String, required: true, index: true },
  farmerName:   { type: String },
  provider: {
    type: String,
    enum: ['Pradhan Mantri Fasal Bima','Weather Based Crop Insurance','Unified Package','Coconut Palm Insurance','Modified National Agriculture Insurance Scheme'],
    required: true,
  },
  uin:          { type: String },
  policyNumber: { type: String },
  cropName:     { type: String },
  claimAmount:  { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Under Review','Approved','Rejected'],
    default: 'Under Review',
  },
  adminNote: { type: String },
  // AI Analysis
  authenticityScore:  { type: Number },
  damageConfidence:   { type: Number },
  damagePrediction:   { type: String },
  aiReasoning:        { type: String },
  // Fraud
  fraudRiskScore:   { type: Number, default: 0 },
  fraudRiskLevel:   { type: String, enum: ['LOW_RISK','MEDIUM_RISK','HIGH_RISK','EXTREME_RISK'], default: 'LOW_RISK' },
  fraudReason:      { type: String },
  // Eligibility
  eligibilityScore:     { type: Number },
  eligibilityReasoning: { type: String },
  predictedEligible:    { type: Boolean },
  featureVector:        { type: [Number] },
}, { timestamps: true });

module.exports = mongoose.model('Insurance', InsuranceSchema);
