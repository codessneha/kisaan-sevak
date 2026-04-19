const insuranceService = require('../services/insuranceService');

/** POST /api/insurance */
const fileClaim = async (req, res, next) => {
  try {
    // multer puts the file buffer in req.file
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }
    const claim = await insuranceService.fileClaim(req.user.uid, req.body, imageBase64);
    res.status(201).json({ success: true, data: claim, message: 'Insurance claim submitted' });
  } catch (err) { next(err); }
};

/** GET /api/insurance */
const getUserClaims = async (req, res, next) => {
  try {
    const claims = await insuranceService.getUserClaims(req.user.uid);
    res.json({ success: true, data: claims });
  } catch (err) { next(err); }
};

/** GET /api/insurance/:id */
const getClaimById = async (req, res, next) => {
  try {
    const claim = await insuranceService.getClaimById(req.user.uid, req.params.id);
    res.json({ success: true, data: claim });
  } catch (err) { next(err); }
};

/** GET /api/insurance/all   (admin) */
const getAllClaims = async (req, res, next) => {
  try {
    const { page, limit, status, search } = req.query;
    const result = await insuranceService.getAllClaims({ page, limit, status, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/** PUT /api/insurance/:id/status   (admin) */
const updateClaimStatus = async (req, res, next) => {
  try {
    const claim = await insuranceService.updateClaimStatus(req.params.id, req.body.status, req.body.adminNote);
    res.json({ success: true, data: claim, message: `Claim status updated to ${req.body.status}` });
  } catch (err) { next(err); }
};

/** DELETE /api/insurance/:id   (admin) */
const deleteClaim = async (req, res, next) => {
  try {
    await insuranceService.deleteClaim(req.params.id);
    res.json({ success: true, message: 'Claim deleted' });
  } catch (err) { next(err); }
};

/** GET /api/insurance/stats   (admin) */
const getInsuranceStats = async (req, res, next) => {
  try {
    const stats = await insuranceService.getInsuranceStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = { fileClaim, getUserClaims, getClaimById, getAllClaims, updateClaimStatus, deleteClaim, getInsuranceStats };
