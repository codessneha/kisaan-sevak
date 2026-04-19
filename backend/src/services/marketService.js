const marketRepository = require('../repositories/marketRepository');
const { callGroqJSON, MODELS } = require('./groqService');

/**
 * Get current prices for a crop, optionally filtered by state.
 * If no DB data exists, ask AI to estimate.
 */
const getPrices = async (cropName, state) => {
  const prices = await marketRepository.findAllLatest(state);

  // Filter by crop if specified
  const filtered = cropName
    ? prices.filter(p => p.cropName.toLowerCase().includes(cropName.toLowerCase()))
    : prices;

  if (filtered.length > 0) return { prices: filtered, source: 'database' };

  // AI estimate fallback
  try {
    const result = await callGroqJSON(
      `Provide current approximate market prices for ${cropName} in ${state || 'India'}.
Respond ONLY with JSON: {"minPrice": <number>, "maxPrice": <number>, "modalPrice": <number>, "unit": "quintal", "note": "<brief context>"}`,
      MODELS.fast
    );
    return {
      prices: [{
        cropName,
        state:      state || 'India',
        minPrice:   result.minPrice,
        maxPrice:   result.maxPrice,
        modalPrice: result.modalPrice,
        unit:       result.unit || 'quintal',
        date:       new Date(),
        source:     'ai_estimate',
      }],
      source: 'ai_estimate',
      note:   result.note,
    };
  } catch (_) {
    return { prices: [], source: 'unavailable', note: 'Price data not available' };
  }
};

const getPriceHistory = async (cropName, state, days = 30) => {
  return marketRepository.findByCropHistory(cropName, state, days);
};

/** Admin: bulk upsert market prices */
const upsertPrice = async (cropName, state, market, data) => {
  return marketRepository.upsertPrice(cropName, state, market, data);
};

module.exports = { getPrices, getPriceHistory, upsertPrice };
