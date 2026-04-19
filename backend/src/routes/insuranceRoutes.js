const router   = require('express').Router();
const multer   = require('multer');
const ctrl     = require('../controllers/insuranceController');
const { authMiddleware, adminAuth } = require('../middleware/auth');
const validate  = require('../middleware/validate');
const { fileClaimValidator, updateClaimStatusValidator } = require('../validators/insuranceValidator');
const { param } = require('express-validator');

const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }); // 5 MB
const mongoId = param('id').isMongoId().withMessage('Invalid ID');

// ── Farmer routes ────────────────────────────────────────────────────────────
router.post('/',    authMiddleware, upload.single('document'), fileClaimValidator, validate, ctrl.fileClaim);
router.get ('/',    authMiddleware, ctrl.getUserClaims);
router.get ('/:id', authMiddleware, mongoId, validate, ctrl.getClaimById);

// ── Admin routes ─────────────────────────────────────────────────────────────
router.get   ('/admin/all',        adminAuth, ctrl.getAllClaims);
router.get   ('/admin/stats',      adminAuth, ctrl.getInsuranceStats);
router.put   ('/admin/:id/status', adminAuth, updateClaimStatusValidator, validate, ctrl.updateClaimStatus);
router.delete('/admin/:id',        adminAuth, mongoId, validate, ctrl.deleteClaim);

module.exports = router;
