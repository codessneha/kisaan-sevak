const Loan = require('../models/Loan');
const Insurance = require('../models/Insurance');

const hashStr = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return Math.abs(h);
};

const cosineSim = (a, b) => {
  if (!a?.length || !b?.length) return 0;
  let dot = 0, ma = 0, mb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; ma += a[i] ** 2; mb += b[i] ** 2; }
  return Math.sqrt(ma) && Math.sqrt(mb) ? dot / (Math.sqrt(ma) * Math.sqrt(mb)) : 0;
};

const loanVector = (d) => [
  Math.min((d.requestedAmount || 0) / 1e6, 10),
  (d.tenureMonths || 12) / 12,
  Math.min((d.landSizeAcres || 0) / 100, 10),
  (100 - (d.fraudRiskScore || 0)) / 100,
  hashStr(d.cropType || '') % 10,
  hashStr(d.loanPurpose || '') % 10,
];

const insuranceVector = (d) => [
  Math.min((d.claimAmount || 0) / 5e5, 10),
  (d.authenticityScore || 50) / 100,
  (d.damageConfidence || 50) / 100,
  hashStr(d.provider || '') % 10,
  0, 0,
];

const predictLoanEligibility = async (data) => {
  const vec = loanVector(data);
  const [approved, rejected] = await Promise.all([
    Loan.find({ status: 'APPROVED', featureVector: { $exists: true, $ne: null } }).limit(50).lean(),
    Loan.find({ status: 'REJECTED', featureVector: { $exists: true, $ne: null } }).limit(50).lean(),
  ]);

  const avgSim = (arr) =>
    arr.length ? arr.reduce((s, l) => s + cosineSim(vec, l.featureVector), 0) / arr.length : 0;

  const approvedSim = avgSim(approved);
  const rejectedSim = avgSim(rejected);
  const fraudPenalty = (data.fraudRiskScore || 0) * 0.3;
  let score = Math.max(0, Math.min(100, approvedSim * 100 - fraudPenalty));

  // Bonus for reasonable loan per acre
  if (data.landSizeAcres && data.requestedAmount) {
    const perAcre = data.requestedAmount / data.landSizeAcres;
    if (perAcre > 50000 && perAcre < 500000) score = Math.min(100, score + 10);
  }

  return {
    eligibilityScore: Math.round(score * 10) / 10,
    predictedEligible: score >= 50,
    eligibilityReasoning: `Score ${score.toFixed(0)}/100. Compared with ${approved.length} approved / ${rejected.length} rejected loans. ${data.fraudRiskScore > 50 ? 'Elevated fraud risk detected.' : ''}`,
    featureVector: vec,
  };
};

const predictInsuranceEligibility = async (data) => {
  const vec = insuranceVector(data);
  const [approved, rejected] = await Promise.all([
    Insurance.find({ status: 'Approved', featureVector: { $exists: true, $ne: null } }).limit(50).lean(),
    Insurance.find({ status: 'Rejected', featureVector: { $exists: true, $ne: null } }).limit(50).lean(),
  ]);

  const avgSim = (arr) =>
    arr.length ? arr.reduce((s, c) => s + cosineSim(vec, c.featureVector), 0) / arr.length : 0;

  let score = avgSim(approved) * 100;
  score += ((data.authenticityScore || 0) + (data.damageConfidence || 0)) * 0.1;
  score = Math.max(0, Math.min(100, score));

  return {
    eligibilityScore: Math.round(score * 10) / 10,
    predictedEligible: score >= 60,
    eligibilityReasoning: `Score ${score.toFixed(0)}/100. Compared with ${approved.length} approved / ${rejected.length} rejected claims.`,
    featureVector: vec,
  };
};

module.exports = { predictLoanEligibility, predictInsuranceEligibility };
