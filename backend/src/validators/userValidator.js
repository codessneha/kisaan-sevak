const { body, param } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty').isLength({ max: 80 }),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
  body('language').optional().isIn(['hi','en','bn','ta','te','mr','gu','pa']).withMessage('Invalid language'),
  body('landSizeAcres').optional().isFloat({ min: 0, max: 99999 }).withMessage('Land size must be a positive number'),
  body('location.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('location.district').optional().trim().notEmpty().withMessage('District cannot be empty'),
  body('location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
  body('adharNumber').optional().matches(/^\d{12}$/).withMessage('Aadhaar must be 12 digits'),
];

module.exports = { updateProfileValidator };
