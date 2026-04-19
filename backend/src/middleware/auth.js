const { getAuth } = require('../config/firebase');
const jwt = require('jsonwebtoken');

/**
 * Firebase token auth for farmer/user routes
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    const decoded = await getAuth().verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/**
 * JWT auth for admin panel
 */
const adminAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Admin token required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid admin token' });
  }
};

/**
 * Optional auth - attaches user if token present but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (token) {
      const decoded = await getAuth().verifyIdToken(token);
      req.user = { uid: decoded.uid, email: decoded.email };
    }
  } catch (_) { /* silent fail */ }
  next();
};

module.exports = { authMiddleware, adminAuth, optionalAuth };
