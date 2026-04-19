const userService = require('../services/userService');

/** GET /api/users/profile */
const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.uid);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

/** PUT /api/users/profile */
const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.uid, req.body);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

/** GET /api/users   (admin only) */
const getAllUsers = async (req, res, next) => {
  try {
    const { page, limit, state, search } = req.query;
    const result = await userService.getAllUsers({ page, limit, state, search });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
};

/** GET /api/users/stats   (admin only) */
const getUserStats = async (req, res, next) => {
  try {
    const stats = await userService.getUserStats();
    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
};

module.exports = { getProfile, updateProfile, getAllUsers, getUserStats };
