const BaseRepository = require('./BaseRepository');
const DiseaseReport = require('../models/DiseaseReport');

class DiseaseRepository extends BaseRepository {
  constructor() {
    super(DiseaseReport);
  }

  async findByUser(firebaseUid) {
    return this.findMany({ firebaseUid }, { sort: { createdAt: -1 } });
  }

  async findByUserAndId(firebaseUid, id) {
    return this.model.findOne({ _id: id, firebaseUid }).lean();
  }

  async markResolved(id, firebaseUid) {
    return this.model.findOneAndUpdate({ _id: id, firebaseUid }, { $set: { resolved: true } }, { new: true }).lean();
  }

  async topDiseases(limit = 5) {
    return this.model.aggregate([
      { $match: { diseaseName: { $exists: true, $ne: null } } },
      { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
    ]);
  }
}

module.exports = new DiseaseRepository();
