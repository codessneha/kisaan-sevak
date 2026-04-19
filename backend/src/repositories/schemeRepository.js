const BaseRepository = require('./BaseRepository');
const GovtScheme = require('../models/GovtScheme');

class SchemeRepository extends BaseRepository {
  constructor() {
    super(GovtScheme);
  }

  async findActive({ category, state, search } = {}) {
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (state)    filter.$or = [{ states: { $size: 0 } }, { states: state }];
    if (search)   filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    return this.model.find(filter).sort({ name: 1 }).lean();
  }

  async findAllPaginated({ page = 1, limit = 20, category, isActive } = {}) {
    const filter = {};
    if (category !== undefined) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive;
    const skip = (page - 1) * limit;
    const [schemes, total] = await Promise.all([
      this.model.find(filter).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter),
    ]);
    return { schemes, total, page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new SchemeRepository();
