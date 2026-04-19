const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }).withMessage('Name too long'),
  body('phone').trim().notEmpty().withMessage('Phone is required').matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  body('firebaseUid').trim().notEmpty().withMessage('Firebase UID is required'),
  body('language').optional().isIn(['hi','en','bn','ta','te','mr','gu','pa']).withMessage('Invalid language code'),
];

const adminLoginValidator = [
  body('email').trim().isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required').isLength({ min: 6 }).withMessage('Minimum 6 characters'),
];

module.exports = { registerValidator, adminLoginValidator };
