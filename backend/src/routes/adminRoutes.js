const router   = require('express').Router();
const ctrl     = require('../controllers/adminController');
const { adminAuth } = require('../middleware/auth');
const validate  = require('../middleware/validate');
const { adminLoginValidator } = require('../validators/authValidator');
const { updateLoanStatusValidator } = require('../validators/loanValidator');
const { updateClaimStatusValidator } = require('../validators/insuranceValidator');
const { body } = require('express-validator');

// ── Public ───────────────────────────────────────────────────────────────────
router.post('/login', adminLoginValidator, validate, ctrl.login);

// ── Protected — all below require admin JWT ───────────────────────────────────
router.use(adminAuth);

// Dashboard
router.get('/dashboard', ctrl.getDashboard);

// Admin management (super_admin only in prod — left as adminAuth for simplicity)
router.post('/create', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('role').optional().isIn(['super_admin','admin','reviewer']),
], validate, ctrl.createAdmin);

// Farmers
router.get('/farmers', ctrl.getFarmers);

// Loans
router.get('/loans',                ctrl.getLoans);
router.put('/loans/:id/status',     updateLoanStatusValidator, validate, ctrl.updateLoanStatus);

// Insurance
router.get('/insurance',            ctrl.getInsuranceClaims);
router.put('/insurance/:id/status', updateClaimStatusValidator, validate, ctrl.updateClaimStatus);

module.exports = router;
