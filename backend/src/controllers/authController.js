const userService = require('../services/userService');
const adminService = require('../services/adminService');

/**
 * POST /api/auth/register
 * Called after Firebase sign-up to persist the user profile in MongoDB.
 */
const register = async (req, res, next) => {
  try {
    const { firebaseUid, name, phone, language, location, landSizeAcres, primaryCrop } = req.body;
    const user = await userService.updateProfile(firebaseUid, {
      name, phone, language, location, landSizeAcres, primaryCrop,
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) { next(err); }
};

/**
 * POST /api/auth/admin/login
 * Returns a JWT for the admin panel.
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await adminService.login(email, password);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

/**
 * GET /api/auth/me
 * Returns the profile of the currently authenticated Firebase user.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await userService.getProfile(req.user.uid);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

module.exports = { register, adminLogin, getMe };
