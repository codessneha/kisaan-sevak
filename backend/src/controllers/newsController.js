const newsService = require('../services/newsService');

/** GET /api/news */
const getNews = async (req, res, next) => {
  try {
    const articles = await newsService.getAgriculturalNews();
    res.json({ success: true, data: articles });
  } catch (err) { next(err); }
};

/** GET /api/news/insights?location=&crops= */
const getInsights = async (req, res, next) => {
  try {
    const { location, crops } = req.query;
    const cropList = crops ? crops.split(',').map(c => c.trim()) : ['general'];
    const insights = await newsService.getFarmInsights(location || 'India', cropList);
    res.json({ success: true, data: insights });
  } catch (err) { next(err); }
};

module.exports = { getNews, getInsights };
