const loanRepository    = require('../repositories/loanRepository');
const userRepository    = require('../repositories/userRepository');
const { assessLoanFraud }           = require('./fraudService');
const { predictLoanEligibility }    = require('./eligibilityService');
const { callGroqJSON, MODELS }      = require('./groqService');
const { loanSummaryPrompt }         = require('../utils/aiPrompts');

/**
 * Apply for a loan.
 * Flow: enrich with user data → fraud check → eligibility predict → save
 */
const applyLoan = async (firebaseUid, body) => {
  // 1. Enrich with user profile data
  const user = await userRepository.findByFirebaseUid(firebaseUid);

  const loanData = {
    firebaseUid,
    farmerName:     user?.name        || body.farmerName || 'Farmer',
    cropType:       body.cropType,
    loanPurpose:    body.loanPurpose,
    requestedAmount:Number(body.requestedAmount),
    tenureMonths:   Number(body.tenureMonths || 12),
    landSizeAcres:  Number(body.landSizeAcres || user?.landSizeAcres || 5),
    farmLocation:   body.farmLocation || (user?.location?.latitude
      ? { lat: user.location.latitude, lng: user.location.longitude }
      : undefined),
  };

  // 2. Fraud assessment
  const fraud = await assessLoanFraud(loanData);

  // 3. Eligibility prediction
  const eligibility = await predictLoanEligibility({ ...loanData, fraudRiskScore: fraud.fraudRiskScore });

  // 4. AI narrative summary
  let aiAssessment = null;
  try {
    aiAssessment = await callGroqJSON(loanSummaryPrompt({ ...loanData, ...fraud }), MODELS.fast);
  } catch (_) { /* non-blocking */ }

  // 5. Persist
  const loan = await loanRepository.create({
    ...loanData,
    ...fraud,
    ...eligibility,
    aiAssessment,
    status: 'PENDING',
  });

  return loan;
};

const getUserLoans = async (firebaseUid) => {
  return loanRepository.findByUser(firebaseUid);
};

const getLoanById = async (firebaseUid, id) => {
  const loan = await loanRepository.findByUserAndId(firebaseUid, id);
  if (!loan) throw Object.assign(new Error('Loan not found'), { statusCode: 404 });
  return loan;
};

const getAllLoans = async (filters) => {
  return loanRepository.findAllPaginated(filters);
};

const updateLoanStatus = async (id, status, adminNote) => {
  const loan = await loanRepository.updateStatus(id, status, adminNote);
  if (!loan) throw Object.assign(new Error('Loan not found'), { statusCode: 404 });
  return loan;
};

const deleteLoan = async (id) => {
  const loan = await loanRepository.deleteById(id);
  if (!loan) throw Object.assign(new Error('Loan not found'), { statusCode: 404 });
  return loan;
};

const getLoanStats = async () => {
  const [byStatus, totalDisbursed, total] = await Promise.all([
    loanRepository.statsByStatus(),
    loanRepository.totalDisbursed(),
    loanRepository.count(),
  ]);
  return { byStatus, totalDisbursed, total };
};

module.exports = { applyLoan, getUserLoans, getLoanById, getAllLoans, updateLoanStatus, deleteLoan, getLoanStats };
