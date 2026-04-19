const router  = require('express').Router();
const ctrl    = require('../controllers/cropController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { addCropValidator } = require('../validators/cropValidator');
const { param } = require('express-validator');

const mongoId = param('id').isMongoId().withMessage('Invalid ID');

// All routes require Firebase token
router.use(authMiddleware);

router.post('/',    addCropValidator, validate, ctrl.addCrop);
router.get ('/',    ctrl.getUserCrops);
router.get ('/:id', mongoId, validate, ctrl.getCropById);
router.delete('/:id', mongoId, validate, ctrl.deleteCrop);

module.exports = router;
