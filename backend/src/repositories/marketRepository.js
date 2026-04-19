const BaseRepository = require('./BaseRepository');
const MarketPrice = require('../models/MarketPrice');

class MarketPriceRepository extends BaseRepository {
  constructor() {
    super(MarketPrice);
  }

  async findLatestByCrop(cropName, state) {
    const filter = { cropName: new RegExp(cropName, 'i') };
    if (state) filter.state = state;
    return this.model.findOne(filter).sort({ date: -1 }).lean();
  }

  async findByCropHistory(cropName, state, days = 30) {
    const from = new Date();
    from.setDate(from.getDate() - days);
    const filter = { cropName: new RegExp(cropName, 'i'), date: { $gte: from } };
    if (state) filter.state = state;
    return this.model.find(filter).sort({ date: -1 }).lean();
  }

  async findAllLatest(state) {
    const pipeline = [
      ...(state ? [{ $match: { state } }] : []),
      { $sort: { date: -1 } },
      { $group: { _id: '$cropName', doc: { $first: '$$ROOT' } } },
      { $replaceRoot: { newRoot: '$doc' } },
      { $sort: { cropName: 1 } },
    ];
    return this.model.aggregate(pipeline);
  }

  async upsertPrice(cropName, state, market, data) {
    return this.model.findOneAndUpdate(
      { cropName, state, market, date: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
      { $set: { ...data, cropName, state, market } },
      { new: true, upsert: true }
    ).lean();
  }
}

module.exports = new MarketPriceRepository();
