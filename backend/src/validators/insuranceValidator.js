const { body, param } = require('express-validator');

const fileClaimValidator = [
  body('provider')
    .trim()
    .notEmpty().withMessage('Insurance provider is required')
    .isIn(['Pradhan Mantri Fasal Bima','Weather Based Crop Insurance','Unified Package','Coconut Palm Insurance','Modified National Agriculture Insurance Scheme'])
    .withMessage('Invalid insurance provider'),
  body('cropName').trim().notEmpty().withMessage('Crop name is required'),
  body('claimAmount')
    .notEmpty().withMessage('Claim amount is required')
    .isFloat({ min: 100, max: 10000000 }).withMessage('Claim amount must be between ₹100 and ₹1,00,00,000'),
  body('uin').optional().trim().isLength({ max: 50 }),
  body('policyNumber').optional().trim().isLength({ max: 50 }),
];

const updateClaimStatusValidator = [
  param('id').isMongoId().withMessage('Invalid claim ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Under Review','Approved','Rejected']).withMessage('Invalid status'),
  body('adminNote').optional().trim().isLength({ max: 500 }),
];

module.exports = { fileClaimValidator, updateClaimStatusValidator };
