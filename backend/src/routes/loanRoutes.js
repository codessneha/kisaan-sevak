const router   = require('express').Router();
const ctrl     = require('../controllers/loanController');
const { authMiddleware, adminAuth } = require('../middleware/auth');
const validate  = require('../middleware/validate');
const { applyLoanValidator, updateLoanStatusValidator } = require('../validators/loanValidator');
const { param } = require('express-validator');

const mongoId = param('id').isMongoId().withMessage('Invalid ID');

// ── Farmer routes (Firebase token) ──────────────────────────────────────────
router.post('/',    authMiddleware, applyLoanValidator, validate, ctrl.applyLoan);
router.get ('/',    authMiddleware, ctrl.getUserLoans);
router.get ('/:id', authMiddleware, mongoId, validate, ctrl.getLoanById);

// ── Admin routes (JWT) ───────────────────────────────────────────────────────
router.get   ('/admin/all',        adminAuth, ctrl.getAllLoans);
router.get   ('/admin/stats',      adminAuth, ctrl.getLoanStats);
router.put   ('/admin/:id/status', adminAuth, updateLoanStatusValidator, validate, ctrl.updateLoanStatus);
router.delete('/admin/:id',        adminAuth, mongoId, validate, ctrl.deleteLoan);

module.exports = router;
