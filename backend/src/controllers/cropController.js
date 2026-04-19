const cropService = require('../services/cropService');

/** POST /api/crops */
const addCrop = async (req, res, next) => {
  try {
    const crop = await cropService.addCrop(req.user.uid, req.body);
    res.status(201).json({ success: true, data: crop, message: 'Crop added and yield predicted' });
  } catch (err) { next(err); }
};

/** GET /api/crops */
const getUserCrops = async (req, res, next) => {
  try {
    const crops = await cropService.getUserCrops(req.user.uid);
    res.json({ success: true, data: crops });
  } catch (err) { next(err); }
};

/** GET /api/crops/:id */
const getCropById = async (req, res, next) => {
  try {
    const crop = await cropService.getCropById(req.user.uid, req.params.id);
    res.json({ success: true, data: crop });
  } catch (err) { next(err); }
};

/** DELETE /api/crops/:id */
const deleteCrop = async (req, res, next) => {
  try {
    await cropService.deleteCrop(req.user.uid, req.params.id);
    res.json({ success: true, message: 'Crop record deleted' });
  } catch (err) { next(err); }
};

module.exports = { addCrop, getUserCrops, getCropById, deleteCrop };
