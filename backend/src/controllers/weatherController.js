const { getWeatherForecast } = require('../services/weatherService');

/** GET /api/weather?lat=&lon= */
const getWeather = async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    const data = await getWeatherForecast(lat, lon);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getWeather };
