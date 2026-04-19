const schemeRepository = require('../repositories/schemeRepository');

const getSchemes = async ({ category, state, search } = {}) => {
  return schemeRepository.findActive({ category, state, search });
};

const getAllSchemes = async (filters) => {
  return schemeRepository.findAllPaginated(filters);
};

const createScheme = async (data) => {
  return schemeRepository.create(data);
};

const updateScheme = async (id, data) => {
  const scheme = await schemeRepository.updateById(id, data);
  if (!scheme) throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
  return scheme;
};

const deleteScheme = async (id) => {
  const scheme = await schemeRepository.deleteById(id);
  if (!scheme) throw Object.assign(new Error('Scheme not found'), { statusCode: 404 });
  return scheme;
};

module.exports = { getSchemes, getAllSchemes, createScheme, updateScheme, deleteScheme };
