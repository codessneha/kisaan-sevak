const { callGroq, MODELS } = require('./groqService');
const { chatPrompt, farmSummaryPrompt } = require('../utils/aiPrompts');
const userRepository = require('../repositories/userRepository');
const cropRepository = require('../repositories/cropRepository');

const chat = async (firebaseUid, message, language = 'hi') => {
  // Fetch lightweight farmer context to personalise the response
  let farmerProfile = {};
  try {
    const user = await userRepository.findByFirebaseUid(firebaseUid);
    if (user) {
      farmerProfile = {
        name:         user.name,
        state:        user.location?.state,
        primaryCrop:  user.primaryCrop,
        landAcres:    user.landSizeAcres,
        language,
      };
    }
  } catch (_) { /* non-blocking */ }

  const prompt = chatPrompt(message, farmerProfile);
  const reply  = await callGroq(prompt, MODELS.vision);

  return { reply, language };
};

const getFarmSummary = async (firebaseUid) => {
  const [user, crops] = await Promise.all([
    userRepository.findByFirebaseUid(firebaseUid),
    cropRepository.findByUser(firebaseUid),
  ]);

  if (!user) throw Object.assign(new Error('User profile not found'), { statusCode: 404 });

  const latestCrop = crops[0] || {};
  const farmerData = {
    name:           user.name,
    state:          user.location?.state,
    district:       user.location?.district,
    landAcres:      user.landSizeAcres,
    primaryCrop:    user.primaryCrop,
    soilType:       user.soilType,
    crops:          crops.slice(0, 5).map(c => ({
      name:          c.cropName,
      yieldKgPerAcre:c.predictedYieldKgPerAcre,
      yieldCategory: c.yieldCategory,
      soilScore:     c.soilHealthScore,
    })),
    latestAdvisory: latestCrop.advisory,
  };

  const { callGroqJSON } = require('./groqService');
  const summary = await callGroqJSON(farmSummaryPrompt(farmerData), MODELS.smart);
  return { summary, farmerData };
};

module.exports = { chat, getFarmSummary };
