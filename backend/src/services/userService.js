const userRepository = require('../repositories/userRepository');

/**
 * UserService — business logic for user operations.
 * Controllers call this; this calls the repository.
 */

const getOrCreateProfile = async (firebaseUid, defaults = {}) => {
  let user = await userRepository.findByFirebaseUid(firebaseUid);
  if (!user) {
    user = await userRepository.create({ firebaseUid, ...defaults });
  }
  return user;
};

const getProfile = async (firebaseUid) => {
  const user = await userRepository.findByFirebaseUid(firebaseUid);
  if (!user) throw Object.assign(new Error('User profile not found'), { statusCode: 404 });
  return user;
};

const updateProfile = async (firebaseUid, updates) => {
  // Prevent overwriting firebaseUid
  delete updates.firebaseUid;

  let user = await userRepository.findByFirebaseUid(firebaseUid);
  if (!user) {
    // Auto-create on first update (common Firebase flow)
    user = await userRepository.create({ firebaseUid, ...updates });
  } else {
    user = await userRepository.upsertByFirebaseUid(firebaseUid, updates);
  }

  // Mark profile complete if key fields are set
  const isComplete = !!(user.name && user.phone && user.location?.state && user.landSizeAcres);
  if (isComplete && !user.profileComplete) {
    user = await userRepository.upsertByFirebaseUid(firebaseUid, { profileComplete: true });
  }

  return user;
};

const getAllUsers = async (filters) => {
  return userRepository.getAllPaginated(filters);
};

const getUserStats = async () => {
  const [total, byState] = await Promise.all([
    userRepository.count(),
    userRepository.countByState(),
  ]);
  return { total, byState };
};

module.exports = { getOrCreateProfile, getProfile, updateProfile, getAllUsers, getUserStats };
