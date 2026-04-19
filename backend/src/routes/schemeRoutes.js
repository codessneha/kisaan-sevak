const router  = require('express').Router();
const ctrl    = require('../controllers/schemeController');
const { optionalAuth, adminAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { schemeValidator } = require('../validators/aiValidator');
const { param } = require('express-validator');

const mongoId = param('id').isMongoId().withMessage('Invalid ID');

// Public read
router.get('/',    optionalAuth, schemeValidator, validate, ctrl.getSchemes);

// Admin
router.get ('/admin/all', adminAuth, ctrl.getAllSchemes);
router.post('/',          adminAuth, ctrl.createScheme);
router.put ('/:id',       adminAuth, mongoId, validate, ctrl.updateScheme);
router.delete('/:id',     adminAuth, mongoId, validate, ctrl.deleteScheme);

module.exports = router;
