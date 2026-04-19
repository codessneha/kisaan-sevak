const BaseRepository = require('./BaseRepository');
const Admin = require('../models/Admin');

class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }

  // select: false on password by default — explicitly include it for login
  async findByEmailWithPassword(email) {
    return this.model.findOne({ email: email.toLowerCase() }).select('+password').lean();
  }

  async findByEmail(email) {
    return this.model.findOne({ email: email.toLowerCase() }).lean();
  }

  async updateLastLogin(id) {
    return this.model.findByIdAndUpdate(id, { lastLogin: new Date() }).lean();
  }
}

module.exports = new AdminRepository();
