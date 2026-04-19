const BaseRepository = require('./BaseRepository');
const Crop = require('../models/Crop');

class CropRepository extends BaseRepository {
  constructor() {
    super(Crop);
  }

  async findByUser(firebaseUid, options = {}) {
    return this.findMany({ firebaseUid }, { sort: { createdAt: -1 }, ...options });
  }

  async findByUserAndId(firebaseUid, id) {
    return this.model.findOne({ _id: id, firebaseUid }).lean();
  }

  async deleteByUserAndId(firebaseUid, id) {
    return this.model.findOneAndDelete({ _id: id, firebaseUid }).lean();
  }

  async getLatestPerUser(firebaseUid) {
    return this.model.findOne({ firebaseUid }).sort({ createdAt: -1 }).lean();
  }

  async cropCountByType() {
    return this.model.aggregate([
      { $group: { _id: '$cropName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
  }
}

module.exports = new CropRepository();
