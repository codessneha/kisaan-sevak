const { callGroqJSON, MODELS } = require('./groqService');

const RISK_LEVELS = { 80: 'EXTREME_RISK', 60: 'HIGH_RISK', 40: 'MEDIUM_RISK', 0: 'LOW_RISK' };
const getRiskLevel = (score) => {
  for (const [threshold, level] of Object.entries(RISK_LEVELS).sort((a, b) => b[0] - a[0])) {
    if (score >= threshold) return level;
  }
  return 'LOW_RISK';
};

// ─── LOAN FRAUD ────────────────────────────────────────────────────────────────

const scoreLoanAmount = ({ requestedAmount, landSizeAcres }) => {
  if (!requestedAmount || !landSizeAcres) return { score: 0, label: 'Loan-to-Land', note: 'Insufficient data' };
  const perAcre = requestedAmount / landSizeAcres;
  let score = 0, note = '';
  if (perAcre < 50000)       { score = 2;  note = 'Conservative amount'; }
  else if (perAcre < 200000) { score = 5;  note = 'Normal range'; }
  else if (perAcre < 400000) { score = 12; note = 'Higher end'; }
  else if (perAcre < 600000) { score = 18; note = 'Exceeds typical'; }
  else                       { score = 25; note = `Extreme: ₹${perAcre.toFixed(0)}/acre` }
  return { score, label: 'Loan-to-Land', note };
};

const scoreLoanProfile = ({ farmerName, landSizeAcres, cropType }) => {
  let score = 0, missing = [];
  if (!farmerName || farmerName === 'Farmer') { score += 8; missing.push('name'); }
  if (!landSizeAcres) { score += 4; missing.push('land size'); }
  if (!cropType || cropType === 'General') { score += 3; missing.push('crop type'); }
  return { score: Math.min(score, 15), label: 'Profile', note: missing.length ? `Missing: ${missing.join(', ')}` : 'Complete' };
};

const scoreLoanTenure = ({ tenureMonths }) => {
  if (!tenureMonths) return { score: 0, label: 'Tenure', note: 'Not specified' };
  let score = 0, note = '';
  if (tenureMonths < 6)       { score = 15; note = 'Suspiciously short'; }
  else if (tenureMonths < 12) { score = 8;  note = 'Below minimum'; }
  else if (tenureMonths <= 60){ score = 2;  note = 'Normal'; }
  else                        { score = 5;  note = 'Long tenure'; }
  return { score, label: 'Tenure', note: `${tenureMonths} months - ${note}` };
};

const aiLoanScore = async (data) => {
  try {
    const result = await callGroqJSON(
      `Analyze agricultural loan for fraud risk. Respond ONLY JSON:
{"fraud_score": <0-25>, "red_flags": [], "assessment": ""}
Data: amount=₹${data.requestedAmount}, acres=${data.landSizeAcres}, crop=${data.cropType}, purpose=${data.loanPurpose}, tenure=${data.tenureMonths}mo`,
      MODELS.fast
    );
    return { score: Math.min(result.fraud_score || 0, 25), label: 'AI Analysis', note: result.assessment, redFlags: result.red_flags || [] };
  } catch {
    return { score: 5, label: 'AI Analysis', note: 'AI unavailable – manual review recommended' };
  }
};

const assessLoanFraud = async (data) => {
  const factors = [
    scoreLoanAmount(data),
    scoreLoanProfile(data),
    scoreLoanTenure(data),
    await aiLoanScore(data),
  ];
  const totalScore = Math.min(factors.reduce((s, f) => s + f.score, 0), 100);
  const riskLevel = getRiskLevel(totalScore);
  return {
    fraudRiskScore: totalScore,
    fraudRiskLevel: riskLevel,
    fraudReason: factors.map(f => f.note).join(' | '),
    fraudRiskFactors: factors,
    requiresManualReview: totalScore > 60,
  };
};

// ─── INSURANCE FRAUD ───────────────────────────────────────────────────────────

const scoreClaimAmount = ({ claimAmount }) => {
  if (!claimAmount) return { score: 0, label: 'Claim Amount', note: 'Not specified' };
  let score = 0, note = '';
  if (claimAmount < 5000)        { score = 2;  note = 'Small claim'; }
  else if (claimAmount <= 100000){ score = 3;  note = 'Normal range'; }
  else if (claimAmount <= 250000){ score = 8;  note = 'Higher range'; }
  else if (claimAmount <= 500000){ score = 15; note = 'Large – verify carefully'; }
  else                           { score = 20; note = 'Exceeds typical limits'; }
  return { score, label: 'Claim Amount', note: `₹${claimAmount.toLocaleString('en-IN')} – ${note}` };
};

const scoreDocQuality = ({ authenticityScore }) => {
  if (!authenticityScore) return { score: 10, label: 'Document Quality', note: 'No authenticity score' };
  const score = authenticityScore >= 80 ? 2 : authenticityScore >= 60 ? 8 : 20;
  return { score, label: 'Document Quality', note: `Authenticity ${authenticityScore}/100` };
};

const scoreDamage = ({ damageConfidence }) => {
  if (!damageConfidence) return { score: 15, label: 'Damage Evidence', note: 'No damage evidence' };
  const score = damageConfidence >= 80 ? 2 : damageConfidence >= 50 ? 10 : 20;
  return { score, label: 'Damage Evidence', note: `Confidence ${damageConfidence}/100` };
};

const aiInsuranceScore = async (data) => {
  try {
    const result = await callGroqJSON(
      `Analyze insurance claim for fraud. Respond ONLY JSON:
{"fraud_score": <0-25>, "red_flags": [], "assessment": ""}
Data: provider=${data.provider}, amount=₹${data.claimAmount}, auth=${data.authenticityScore}, damage=${data.damageConfidence}`,
      MODELS.fast
    );
    return { score: Math.min(result.fraud_score || 0, 25), label: 'AI Analysis', note: result.assessment, redFlags: result.red_flags || [] };
  } catch {
    return { score: 5, label: 'AI Analysis', note: 'AI unavailable' };
  }
};

const assessInsuranceFraud = async (data) => {
  const factors = [
    scoreClaimAmount(data),
    scoreDocQuality(data),
    scoreDamage(data),
    await aiInsuranceScore(data),
  ];
  const totalScore = Math.min(factors.reduce((s, f) => s + f.score, 0), 100);
  return {
    fraudRiskScore: totalScore,
    fraudRiskLevel: getRiskLevel(totalScore),
    fraudReason: factors.map(f => f.note).join(' | '),
    fraudRiskFactors: factors,
    requiresManualReview: totalScore > 60,
  };
};

module.exports = { assessLoanFraud, assessInsuranceFraud, getRiskLevel };
