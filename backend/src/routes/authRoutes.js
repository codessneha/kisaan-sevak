const router  = require('express').Router();
const ctrl    = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const validate           = require('../middleware/validate');
const { registerValidator, adminLoginValidator } = require('../validators/authValidator');

// POST /api/auth/register  — no token needed (called right after Firebase sign-up)
router.post('/register', registerValidator, validate, ctrl.register);

// POST /api/auth/admin/login  — returns JWT
router.post('/admin/login', adminLoginValidator, validate, ctrl.adminLogin);

// GET  /api/auth/me  — Firebase token required
router.get('/me', authMiddleware, ctrl.getMe);

module.exports = router;
