/**
 * BaseRepository
 * Generic CRUD wrapper around a Mongoose model.
 * All feature repositories extend this class.
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id) {
    return this.model.findById(id).lean();
  }

  async findOne(filter) {
    return this.model.findOne(filter).lean();
  }

  async findMany(filter = {}, options = {}) {
    const { sort = { createdAt: -1 }, limit = 100, skip = 0, select } = options;
    let q = this.model.find(filter).sort(sort).skip(skip).limit(limit);
    if (select) q = q.select(select);
    return q.lean();
  }

  async create(data) {
    const doc = await this.model.create(data);
    return doc.toObject();
  }

  async updateById(id, data) {
    return this.model.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean();
  }

  async deleteById(id) {
    return this.model.findByIdAndDelete(id).lean();
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async exists(filter) {
    return this.model.exists(filter);
  }
}

module.exports = BaseRepository;
