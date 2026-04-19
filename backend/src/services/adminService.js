const jwt       = require('jsonwebtoken');
const bcrypt    = require('bcryptjs');
const adminRepository    = require('../repositories/adminRepository');
const userRepository     = require('../repositories/userRepository');
const loanRepository     = require('../repositories/loanRepository');
const insuranceRepository = require('../repositories/insuranceRepository');

const signToken = (admin) =>
  jwt.sign(
    { id: admin._id, email: admin.email, role: admin.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );

const login = async (email, password) => {
  const admin = await adminRepository.findByEmailWithPassword(email);
  if (!admin) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  if (!admin.isActive) throw Object.assign(new Error('Account is deactivated'), { statusCode: 403 });

  await adminRepository.updateLastLogin(admin._id);

  const token = signToken(admin);
  const { password: _, ...adminData } = admin;
  return { token, admin: adminData };
};

const createAdmin = async (data) => {
  const exists = await adminRepository.findByEmail(data.email);
  if (exists) throw Object.assign(new Error('Admin with this email already exists'), { statusCode: 409 });
  return adminRepository.create(data);
};

const getDashboardStats = async () => {
  const [
    totalFarmers,
    loanStats,
    insuranceStats,
    recentLoans,
    recentClaims,
    userStats,
  ] = await Promise.all([
    userRepository.count(),
    loanRepository.statsByStatus(),
    insuranceRepository.statsByStatus(),
    loanRepository.findAllPaginated({ page: 1, limit: 5 }),
    insuranceRepository.findAllPaginated({ page: 1, limit: 5 }),
    userRepository.countByState(),
  ]);

  // Flatten loan stats into an easy-to-consume map
  const loanMap = Object.fromEntries(loanStats.map(s => [s._id, { count: s.count, amount: s.totalAmount }]));
  const insMap  = Object.fromEntries(insuranceStats.map(s => [s._id, { count: s.count, amount: s.totalClaimed }]));

  return {
    farmers: {
      total: totalFarmers,
      byState: userStats,
    },
    loans: {
      total:       (loanMap.PENDING?.count || 0) + (loanMap.APPROVED?.count || 0) + (loanMap.REJECTED?.count || 0) + (loanMap.UNDER_REVIEW?.count || 0),
      pending:     loanMap.PENDING     || { count: 0, amount: 0 },
      approved:    loanMap.APPROVED    || { count: 0, amount: 0 },
      rejected:    loanMap.REJECTED    || { count: 0, amount: 0 },
      underReview: loanMap.UNDER_REVIEW || { count: 0, amount: 0 },
    },
    insurance: {
      total:      (insMap['Under Review']?.count || 0) + (insMap.Approved?.count || 0) + (insMap.Rejected?.count || 0),
      underReview: insMap['Under Review'] || { count: 0, amount: 0 },
      approved:    insMap.Approved        || { count: 0, amount: 0 },
      rejected:    insMap.Rejected        || { count: 0, amount: 0 },
    },
    recent: {
      loans:  recentLoans.loans,
      claims: recentClaims.claims,
    },
  };
};

module.exports = { login, createAdmin, getDashboardStats };
