const insuranceRepository = require('../repositories/insuranceRepository');
const userRepository      = require('../repositories/userRepository');
const { assessInsuranceFraud }      = require('./fraudService');
const { predictInsuranceEligibility } = require('./eligibilityService');
const { callGroqJSON, MODELS }      = require('./groqService');
const { insuranceSummaryPrompt }    = require('../utils/aiPrompts');

/**
 * File an insurance claim.
 * Flow: AI document analysis → fraud check → eligibility predict → save
 */
const fileClaim = async (firebaseUid, body, imageBase64 = null) => {
  const user = await userRepository.findByFirebaseUid(firebaseUid);

  // 1. AI vision analysis of document / damage photo
  let aiResult = {
    authenticityScore: 70,
    damageConfidence:  70,
    damagePrediction:  'Unable to analyze – manual review required',
    recommendation:    'Under Review',
    reasoning:         'AI analysis skipped',
  };

  try {
    aiResult = await callGroqJSON(
      insuranceSummaryPrompt({ ...body, imageProvided: !!imageBase64 }),
      imageBase64 ? MODELS.vision : MODELS.fast,
      imageBase64
    );
    // Normalize keys
    aiResult = {
      authenticityScore: aiResult.authenticity_score ?? aiResult.authenticityScore ?? 70,
      damageConfidence:  aiResult.damage_confidence  ?? aiResult.damageConfidence  ?? 70,
      damagePrediction:  aiResult.damage_prediction  ?? aiResult.damagePrediction  ?? '',
      recommendation:    aiResult.recommendation     ?? 'Under Review',
      reasoning:         aiResult.reasoning          ?? '',
    };
  } catch (err) {
    console.error('[InsuranceService] AI analysis failed:', err.message);
  }

  const claimData = {
    firebaseUid,
    farmerName:       user?.name || body.farmerName || 'Farmer',
    provider:         body.provider,
    cropName:         body.cropName,
    uin:              body.uin,
    policyNumber:     body.policyNumber,
    claimAmount:      Number(body.claimAmount),
    ...aiResult,
  };

  // 2. Fraud assessment
  const fraud = await assessInsuranceFraud(claimData);

  // 3. Eligibility prediction
  const eligibility = await predictInsuranceEligibility({ ...claimData, ...fraud });

  // 4. Determine initial status from AI recommendation
  const status = ['Approved','Rejected'].includes(aiResult.recommendation)
    ? aiResult.recommendation
    : 'Under Review';

  const claim = await insuranceRepository.create({
    ...claimData,
    aiReasoning: aiResult.reasoning,
    ...fraud,
    ...eligibility,
    status,
  });

  return claim;
};

const getUserClaims = async (firebaseUid) => {
  return insuranceRepository.findByUser(firebaseUid);
};

const getClaimById = async (firebaseUid, id) => {
  const claim = await insuranceRepository.findByUserAndId(firebaseUid, id);
  if (!claim) throw Object.assign(new Error('Claim not found'), { statusCode: 404 });
  return claim;
};

const getAllClaims = async (filters) => {
  return insuranceRepository.findAllPaginated(filters);
};

const updateClaimStatus = async (id, status, adminNote) => {
  const claim = await insuranceRepository.updateStatus(id, status, adminNote);
  if (!claim) throw Object.assign(new Error('Claim not found'), { statusCode: 404 });
  return claim;
};

const deleteClaim = async (id) => {
  const claim = await insuranceRepository.deleteById(id);
  if (!claim) throw Object.assign(new Error('Claim not found'), { statusCode: 404 });
  return claim;
};

const getInsuranceStats = async () => {
  const [byStatus, total] = await Promise.all([
    insuranceRepository.statsByStatus(),
    insuranceRepository.count(),
  ]);
  return { byStatus, total };
};

module.exports = { fileClaim, getUserClaims, getClaimById, getAllClaims, updateClaimStatus, deleteClaim, getInsuranceStats };
