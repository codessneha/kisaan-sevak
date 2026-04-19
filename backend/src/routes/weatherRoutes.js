const router   = require('express').Router();
const ctrl     = require('../controllers/weatherController');
const { optionalAuth } = require('../middleware/auth');
const validate  = require('../middleware/validate');
const { weatherValidator } = require('../validators/aiValidator');

// optionalAuth: works with or without token
router.get('/', optionalAuth, weatherValidator, validate, ctrl.getWeather);

module.exports = router;
