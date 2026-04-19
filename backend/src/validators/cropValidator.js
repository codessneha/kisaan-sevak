const { body } = require('express-validator');

const addCropValidator = [
  body('cropName').trim().notEmpty().withMessage('Crop name is required').isLength({ max: 100 }),
  body('landSizeAcres').notEmpty().withMessage('Land size is required').isFloat({ min: 0.1, max: 99999 }).withMessage('Land size must be between 0.1 and 99999 acres'),
  body('soilType').optional().trim().isIn(['clay','loam','sandy','silt','black','red','alluvial','other']).withMessage('Invalid soil type'),
  body('irrigationMethod').optional().trim().isLength({ max: 80 }),
  body('season').optional().isIn(['kharif','rabi','zaid']).withMessage('Season must be kharif, rabi, or zaid'),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
];

module.exports = { addCropValidator };
