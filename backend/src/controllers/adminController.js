const adminService = require('../services/adminService');
const userService  = require('../services/userService');
const loanService  = require('../services/loanService');
const insuranceService = require('../services/insuranceService');

/** POST /api/admin/login */
const login = async (req, res, next) => {
  try {
    const result = await adminService.login(req.body.email, req.body.password);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

/** POST /api/admin/create   (super_admin only) */
const createAdmin = async (req, res, next) => {
  try {
    const admin = await adminService.createAdmin(req.body);
    res.status(201).json({ success: true, data: admin });
  } catch (err) { next(err); }
};

/** GET /api/admin/dashboard */
const getDashboard = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

/** GET /api/admin/farmers */
const getFarmers = async (req, res, next) => {
  try {
    const { page, limit, state, search } = req.query;
    const result = await userService.getAllUsers({ page, limit, state, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/** GET /api/admin/loans */
const getLoans = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await loanService.getAllLoans({ page, limit, status, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/** PUT /api/admin/loans/:id/status */
const updateLoanStatus = async (req, res, next) => {
  try {
    const loan = await loanService.updateLoanStatus(req.params.id, req.body.status, req.body.adminNote);
    res.json({ success: true, data: loan });
  } catch (err) { next(err); }
};

/** GET /api/admin/insurance */
const getInsuranceClaims = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await insuranceService.getAllClaims({ page, limit, status, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/** PUT /api/admin/insurance/:id/status */
const updateClaimStatus = async (req, res, next) => {
  try {
    const claim = await insuranceService.updateClaimStatus(req.params.id, req.body.status, req.body.adminNote);
    res.json({ success: true, data: claim });
  } catch (err) { next(err); }
};

module.exports = { login, createAdmin, getDashboard, getFarmers, getLoans, updateLoanStatus, getInsuranceClaims, updateClaimStatus };
