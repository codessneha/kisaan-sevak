const router  = require('express').Router();
const ctrl    = require('../controllers/marketController');
const { optionalAuth, adminAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { marketValidator } = require('../validators/aiValidator');

// Public read — works with or without token
router.get('/',         optionalAuth, marketValidator, validate, ctrl.getPrices);
router.get('/history',  optionalAuth, ctrl.getPriceHistory);

// Admin write
router.post('/', adminAuth, ctrl.upsertPrice);

module.exports = router;
