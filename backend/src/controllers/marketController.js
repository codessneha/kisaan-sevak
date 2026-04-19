const marketService = require('../services/marketService');

/** GET /api/market?crop=rice&state=Punjab */
const getPrices = async (req, res, next) => {
  try {
    const { crop, state } = req.query;
    const result = await marketService.getPrices(crop, state);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

/** GET /api/market/history?crop=rice&state=Punjab&days=30 */
const getPriceHistory = async (req, res, next) => {
  try {
    const { crop, state, days } = req.query;
    if (!crop) return res.status(400).json({ success: false, message: 'crop is required' });
    const history = await marketService.getPriceHistory(crop, state, Number(days) || 30);
    res.json({ success: true, data: history });
  } catch (err) { next(err); }
};

/** POST /api/market   (admin: add / update prices) */
const upsertPrice = async (req, res, next) => {
  try {
    const { cropName, state, market, minPrice, maxPrice, modalPrice, unit } = req.body;
    if (!cropName || !state) return res.status(400).json({ success: false, message: 'cropName and state are required' });
    const price = await marketService.upsertPrice(cropName, state, market, { minPrice, maxPrice, modalPrice, unit });
    res.status(201).json({ success: true, data: price });
  } catch (err) { next(err); }
};

module.exports = { getPrices, getPriceHistory, upsertPrice };
