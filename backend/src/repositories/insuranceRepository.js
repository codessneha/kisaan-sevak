const BaseRepository = require('./BaseRepository');
const Insurance = require('../models/Insurance');

class InsuranceRepository extends BaseRepository {
  constructor() {
    super(Insurance);
  }

  async findByUser(firebaseUid) {
    return this.findMany({ firebaseUid }, { sort: { createdAt: -1 } });
  }

  async findByUserAndId(firebaseUid, id) {
    return this.model.findOne({ _id: id, firebaseUid }).lean();
  }

  async findAllPaginated({ page = 1, limit = 20, status, search } = {}) {
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.$or = [
      { farmerName: { $regex: search, $options: 'i' } },
      { provider: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [claims, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { claims, total, page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(id, status, adminNote) {
    return this.model.findByIdAndUpdate(id, { $set: { status, adminNote } }, { new: true }).lean();
  }

  async statsByStatus() {
    return this.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalClaimed: { $sum: '$claimAmount' } } },
    ]);
  }
}

module.exports = new InsuranceRepository();
