const aiService      = require('../services/aiService');
const diseaseService = require('../services/diseaseService');

/** POST /api/ai/chat */
const chat = async (req, res, next) => {
  try {
    const { message, language } = req.body;
    const result = await aiService.chat(req.user.uid, message, language);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

/** POST /api/ai/disease */
const diagnoseDisease = async (req, res, next) => {
  try {
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const result = await diseaseService.diagnose(req.user.uid, req.body, imageBase64);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
};

/** GET /api/ai/disease */
const getUserDiseaseReports = async (req, res, next) => {
  try {
    const reports = await diseaseService.getUserReports(req.user.uid);
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
};

/** PATCH /api/ai/disease/:id/resolve */
const resolveDisease = async (req, res, next) => {
  try {
    const report = await diseaseService.markResolved(req.user.uid, req.params.id);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

/** GET /api/ai/farm-summary */
const getFarmSummary = async (req, res, next) => {
  try {
    const result = await aiService.getFarmSummary(req.user.uid);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { chat, diagnoseDisease, getUserDiseaseReports, resolveDisease, getFarmSummary };
