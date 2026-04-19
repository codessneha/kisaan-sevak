const { body, param } = require('express-validator');

const applyLoanValidator = [
  body('cropType').trim().notEmpty().withMessage('Crop type is required'),
  body('loanPurpose')
    .trim()
    .notEmpty().withMessage('Loan purpose is required')
    .isIn(['Seeds','Fertilizers','Pesticides','Equipment','Irrigation','Land-Preparation','Harvesting','Storage','Marketing','General-Agriculture'])
    .withMessage('Invalid loan purpose'),
  body('requestedAmount')
    .notEmpty().withMessage('Requested amount is required')
    .isFloat({ min: 1000, max: 10000000 }).withMessage('Amount must be between ₹1,000 and ₹1,00,00,000'),
  body('tenureMonths')
    .optional()
    .isInt({ min: 1, max: 360 }).withMessage('Tenure must be between 1 and 360 months'),
  body('landSizeAcres')
    .optional()
    .isFloat({ min: 0.1, max: 99999 }).withMessage('Invalid land size'),
];

const updateLoanStatusValidator = [
  param('id').isMongoId().withMessage('Invalid loan ID'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['PENDING','APPROVED','REJECTED','UNDER_REVIEW']).withMessage('Invalid status'),
  body('adminNote').optional().trim().isLength({ max: 500 }),
];

module.exports = { applyLoanValidator, updateLoanStatusValidator };
