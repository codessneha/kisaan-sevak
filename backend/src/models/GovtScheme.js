const mongoose = require('mongoose');

const GovtSchemeSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  description:  { type: String },
  category:     { type: String, enum: ['loan','insurance','subsidy','training','equipment','other'], default: 'other' },
  eligibility:  { type: String },
  benefit:      { type: String },
  applicationLink: { type: String },
  states:       [{ type: String }], // empty = all India
  deadline:     { type: Date },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('GovtScheme', GovtSchemeSchema);
