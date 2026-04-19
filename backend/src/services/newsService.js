const axios = require('axios');

const BASE_URL = 'https://google.serper.dev';

const serperHeaders = () => ({
  'X-API-KEY': process.env.SERPER_API_KEY,
  'Content-Type': 'application/json',
});

const getAgriculturalNews = async () => {
  const { data } = await axios.post(
    `${BASE_URL}/news`,
    { q: 'indian agriculture farming news', num: 10, gl: 'in', hl: 'en' },
    { headers: serperHeaders() }
  );
  return (data.news || []).map(a => ({
    title: a.title,
    snippet: a.snippet,
    link: a.link,
    source: a.source,
    date: a.date,
    imageUrl: a.imageUrl || null,
  }));
};

const getFarmInsights = async (location = 'India', crops = ['general']) => {
  const q = `${location} ${crops.join(' ')} farming tips best practices`;
  const { data } = await axios.post(
    `${BASE_URL}/search`,
    { q, num: 6, gl: 'in', hl: 'en' },
    { headers: serperHeaders() }
  );
  return (data.organic || []).map(r => ({
    title: r.title,
    snippet: r.snippet,
    link: r.link,
  }));
};

module.exports = { getAgriculturalNews, getFarmInsights };
