const router  = require('express').Router();
const multer  = require('multer');
const ctrl    = require('../controllers/aiController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { chatValidator, diseaseValidator } = require('../validators/aiValidator');
const { param } = require('express-validator');

const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const mongoId = param('id').isMongoId().withMessage('Invalid ID');

// All AI routes require Firebase token
router.use(authMiddleware);

// Chat
router.post('/chat', chatValidator, validate, ctrl.chat);

// Disease detection — optional image upload
router.post('/disease',         upload.single('image'), diseaseValidator, validate, ctrl.diagnoseDisease);
router.get ('/disease',         ctrl.getUserDiseaseReports);
router.patch('/disease/:id/resolve', mongoId, validate, ctrl.resolveDisease);

// Farm summary
router.get('/farm-summary', ctrl.getFarmSummary);

module.exports = router;
