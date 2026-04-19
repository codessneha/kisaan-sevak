const router  = require('express').Router();
const ctrl    = require('../controllers/userController');
const { authMiddleware, adminAuth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { updateProfileValidator } = require('../validators/userValidator');

// All farmer routes — Firebase token required
router.get   ('/profile',      authMiddleware,  ctrl.getProfile);
router.put   ('/profile',      authMiddleware, updateProfileValidator, validate, ctrl.updateProfile);

// Admin-only routes — JWT required
router.get   ('/',             adminAuth, ctrl.getAllUsers);
router.get   ('/stats',        adminAuth, ctrl.getUserStats);

module.exports = router;
