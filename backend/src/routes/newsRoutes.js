const router = require('express').Router();
const ctrl   = require('../controllers/newsController');
const { optionalAuth } = require('../middleware/auth');

// Public — works with or without token
router.get('/',         optionalAuth, ctrl.getNews);
router.get('/insights', optionalAuth, ctrl.getInsights);

module.exports = router;
