const schemeService = require('../services/schemeService');

/** GET /api/schemes?category=loan&state=Punjab&search=kisan */
const getSchemes = async (req, res, next) => {
  try {
    const { category, state, search } = req.query;
    const schemes = await schemeService.getSchemes({ category, state, search });
    res.json({ success: true, data: schemes });
  } catch (err) { next(err); }
};

/** GET /api/schemes/all   (admin) */
const getAllSchemes = async (req, res, next) => {
  try {
    const { page, limit, category } = req.query;
    const result = await schemeService.getAllSchemes({ page, limit, category });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/** POST /api/schemes   (admin) */
const createScheme = async (req, res, next) => {
  try {
    const scheme = await schemeService.createScheme(req.body);
    res.status(201).json({ success: true, data: scheme });
  } catch (err) { next(err); }
};

/** PUT /api/schemes/:id   (admin) */
const updateScheme = async (req, res, next) => {
  try {
    const scheme = await schemeService.updateScheme(req.params.id, req.body);
    res.json({ success: true, data: scheme });
  } catch (err) { next(err); }
};

/** DELETE /api/schemes/:id   (admin) */
const deleteScheme = async (req, res, next) => {
  try {
    await schemeService.deleteScheme(req.params.id);
    res.json({ success: true, message: 'Scheme deleted' });
  } catch (err) { next(err); }
};

module.exports = { getSchemes, getAllSchemes, createScheme, updateScheme, deleteScheme };
