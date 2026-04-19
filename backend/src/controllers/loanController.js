const loanService = require('../services/loanService');

/** POST /api/loans */
const applyLoan = async (req, res, next) => {
  try {
    const loan = await loanService.applyLoan(req.user.uid, req.body);
    res.status(201).json({ success: true, data: loan, message: 'Loan application submitted' });
  } catch (err) { next(err); }
};

/** GET /api/loans */
const getUserLoans = async (req, res, next) => {
  try {
    const loans = await loanService.getUserLoans(req.user.uid);
    res.json({ success: true, data: loans });
  } catch (err) { next(err); }
};

/** GET /api/loans/:id */
const getLoanById = async (req, res, next) => {
  try {
    const loan = await loanService.getLoanById(req.user.uid, req.params.id);
    res.json({ success: true, data: loan });
  } catch (err) { next(err); }
};

/** GET /api/loans/all   (admin) */
const getAllLoans = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await loanService.getAllLoans({ page, limit, status, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/** PUT /api/loans/:id/status   (admin) */
const updateLoanStatus = async (req, res, next) => {
  try {
    const loan = await loanService.updateLoanStatus(req.params.id, req.body.status, req.body.adminNote);
    res.json({ success: true, data: loan, message: `Loan status updated to ${req.body.status}` });
  } catch (err) { next(err); }
};

/** DELETE /api/loans/:id   (admin) */
const deleteLoan = async (req, res, next) => {
  try {
    await loanService.deleteLoan(req.params.id);
    res.json({ success: true, message: 'Loan deleted' });
  } catch (err) { next(err); }
};

/** GET /api/loans/stats   (admin) */
const getLoanStats = async (req, res, next) => {
  try {
    const stats = await loanService.getLoanStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = { applyLoan, getUserLoans, getLoanById, getAllLoans, updateLoanStatus, deleteLoan, getLoanStats };
