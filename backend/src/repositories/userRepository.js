const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByFirebaseUid(uid) {
    return this.model.findOne({ firebaseUid: uid }).lean();
  }

  async findByPhone(phone) {
    return this.model.findOne({ phone }).lean();
  }

  async upsertByFirebaseUid(uid, data) {
    return this.model
      .findOneAndUpdate({ firebaseUid: uid }, { $set: data }, { new: true, upsert: true, runValidators: true })
      .lean();
  }

  async getAllPaginated({ page = 1, limit = 20, state, search } = {}) {
    const filter = {};
    if (state) filter['location.state'] = state;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { users, total, page, pages: Math.ceil(total / limit) };
  }

  async countByState() {
    return this.model.aggregate([
      { $group: { _id: '$location.state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
  }
}

module.exports = new UserRepository();
