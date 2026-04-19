const BaseRepository = require('./BaseRepository');
const Loan = require('../models/Loan');

class LoanRepository extends BaseRepository {
  constructor() {
    super(Loan);
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
      { firebaseUid: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [loans, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { loans, total, page, pages: Math.ceil(total / limit) };
  }

  async updateStatus(id, status, adminNote) {
    return this.model.findByIdAndUpdate(id, { $set: { status, adminNote } }, { new: true }).lean();
  }

  async statsByStatus() {
    return this.model.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$requestedAmount' } } },
    ]);
  }

  async totalDisbursed() {
    const result = await this.model.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: null, total: { $sum: '$disbursedAmount' } } },
    ]);
    return result[0]?.total || 0;
  }
}

module.exports = new LoanRepository();
