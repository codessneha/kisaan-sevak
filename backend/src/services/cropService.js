const cropRepository = require('../repositories/cropRepository');
const { callGroqJSON, MODELS } = require('./groqService');
const { yieldPrompt } = require('../utils/aiPrompts');

const predictYield = async (cropData) => {
  try {
    const result = await callGroqJSON(yieldPrompt(cropData), MODELS.smart);
    return result;
  } catch (err) {
    console.error('[CropService] AI yield prediction failed:', err.message);
    // Return safe defaults so save still works
    return {
      predictedYieldKgPerAcre: 0,
      yieldCategory: 'Unknown',
      soilHealthScore: 50,
      climateScore: 50,
      weatherRisk: 'medium',
      advisory: 'AI prediction unavailable. Please consult a local agricultural officer.',
      suggestedCrops: [],
    };
  }
};

const addCrop = async (firebaseUid, cropData) => {
  const prediction = await predictYield({ ...cropData, firebaseUid });

  const crop = await cropRepository.create({
    firebaseUid,
    cropName:         cropData.cropName,
    landSizeAcres:    cropData.landSizeAcres,
    soilType:         cropData.soilType,
    irrigationMethod: cropData.irrigationMethod,
    season:           cropData.season,
    sowingDate:       cropData.sowingDate,
    location:         cropData.location,
    ...prediction,
  });

  return crop;
};

const getCropById = async (firebaseUid, id) => {
  const crop = await cropRepository.findByUserAndId(firebaseUid, id);
  if (!crop) throw Object.assign(new Error('Crop record not found'), { statusCode: 404 });
  return crop;
};

const getUserCrops = async (firebaseUid) => {
  return cropRepository.findByUser(firebaseUid);
};

const deleteCrop = async (firebaseUid, id) => {
  const crop = await cropRepository.deleteByUserAndId(firebaseUid, id);
  if (!crop) throw Object.assign(new Error('Crop record not found'), { statusCode: 404 });
  return crop;
};

module.exports = { addCrop, getCropById, getUserCrops, deleteCrop };
