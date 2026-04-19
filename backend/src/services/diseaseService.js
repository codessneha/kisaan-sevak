const diseaseRepository = require('../repositories/diseaseRepository');
const { callGroqJSON, MODELS } = require('./groqService');
const { diseasePrompt }        = require('../utils/aiPrompts');

const diagnose = async (firebaseUid, body, imageBase64 = null) => {
  const { cropName, symptoms } = body;

  // AI diagnosis — use vision model when image is provided
  let diagnosis = {
    diseaseName:  'Unknown',
    severity:     'moderate',
    aiDiagnosis:  'Unable to analyze. Please describe symptoms or upload a clearer image.',
    treatment:    'Consult a local agricultural extension officer.',
    prevention:   'Maintain proper field hygiene.',
    urgency:      'monitor',
  };

  try {
    const model = imageBase64 ? MODELS.vision : MODELS.smart;
    const result = await callGroqJSON(diseasePrompt(cropName, symptoms, !!imageBase64), model, imageBase64);
    diagnosis = { ...diagnosis, ...result };
  } catch (err) {
    console.error('[DiseaseService] AI diagnosis failed:', err.message);
  }

  const report = await diseaseRepository.create({
    firebaseUid,
    cropName,
    symptoms,
    imageBase64: imageBase64 || undefined,
    diseaseName: diagnosis.diseaseName,
    severity:    diagnosis.severity,
    aiDiagnosis: diagnosis.aiDiagnosis,
    treatment:   diagnosis.treatment,
  });

  return { report, diagnosis };
};

const getUserReports = async (firebaseUid) => {
  return diseaseRepository.findByUser(firebaseUid);
};

const markResolved = async (firebaseUid, id) => {
  const report = await diseaseRepository.markResolved(id, firebaseUid);
  if (!report) throw Object.assign(new Error('Report not found'), { statusCode: 404 });
  return report;
};

module.exports = { diagnose, getUserReports, markResolved };
