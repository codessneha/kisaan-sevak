const mongoose = require('mongoose');

const LoanSchema = new mongoose.Schema({
  firebaseUid:    { type: String, required: true, index: true },
  farmerName:     { type: String, default: 'Farmer' },
  cropType:       { type: String, default: 'General' },
  loanPurpose: {
    type: String,
    enum: ['Seeds','Fertilizers','Pesticides','Equipment','Irrigation','Land-Preparation','Harvesting','Storage','Marketing','General-Agriculture'],
    default: 'General-Agriculture',
  },
  requestedAmount: { type: Number, required: true },
  tenureMonths:    { type: Number, default: 12 },
  landSizeAcres:   { type: Number, default: 0 },
  farmLocation:    { lat: Number, lng: Number },
  status: {
    type: String,
    enum: ['PENDING','APPROVED','REJECTED','UNDER_REVIEW'],
    default: 'PENDING',
  },
  disbursedAmount:  { type: Number, default: 0 },
  adminNote:        { type: String },
  // AI Assessment
  aiAssessment:     { type: Object },
  // Fraud Detection
  fraudRiskScore:   { type: Number, default: 0 },
  fraudRiskLevel:   { type: String, enum: ['LOW_RISK','MEDIUM_RISK','HIGH_RISK','EXTREME_RISK'], default: 'LOW_RISK' },
  fraudReason:      { type: String },
  fraudRiskFactors: { type: Array },
  // Eligibility
  eligibilityScore:     { type: Number },
  eligibilityReasoning: { type: String },
  predictedEligible:    { type: Boolean },
  featureVector:        { type: [Number] },
}, { timestamps: true });

module.exports = mongoose.model('Loan', LoanSchema);
