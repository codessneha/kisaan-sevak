const mongoose = require('mongoose');

const MarketPriceSchema = new mongoose.Schema({
  cropName:   { type: String, required: true, index: true },
  state:      { type: String, required: true },
  market:     { type: String },
  minPrice:   { type: Number },
  maxPrice:   { type: Number },
  modalPrice: { type: Number }, // most common selling price
  unit:       { type: String, default: 'quintal' },
  date:       { type: Date, default: Date.now },
  source:     { type: String, default: 'manual' },
}, { timestamps: true });

MarketPriceSchema.index({ cropName: 1, state: 1, date: -1 });

module.exports = mongoose.model('MarketPrice', MarketPriceSchema);
