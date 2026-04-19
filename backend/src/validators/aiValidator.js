const { body, query } = require('express-validator');

const chatValidator = [
  body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 2000 }).withMessage('Message too long'),
  body('language').optional().isIn(['hi','en','bn','ta','te','mr','gu','pa']).withMessage('Invalid language code'),
];

const diseaseValidator = [
  body('cropName').trim().notEmpty().withMessage('Crop name is required'),
  body('symptoms').optional().trim().isLength({ max: 1000 }),
];

const weatherValidator = [
  query('lat').notEmpty().withMessage('Latitude is required').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  query('lon').notEmpty().withMessage('Longitude is required').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

const marketValidator = [
  query('crop').trim().notEmpty().withMessage('Crop name is required'),
  query('state').optional().trim(),
];

const schemeValidator = [
  query('category').optional().isIn(['loan','insurance','subsidy','training','equipment','other']).withMessage('Invalid category'),
  query('state').optional().trim(),
  query('search').optional().trim().isLength({ max: 100 }),
];

const ttsValidator = [
  body('text').trim().notEmpty().withMessage('Text is required').isLength({ max: 1000 }).withMessage('Text too long'),
  body('language').optional().isIn(['hi','en','bn','ta','te','mr','gu','pa']),
];

module.exports = { chatValidator, diseaseValidator, weatherValidator, marketValidator, schemeValidator, ttsValidator };
