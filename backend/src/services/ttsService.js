const axios = require('axios');

const ELEVENLABS_URL = 'https://api.elevenlabs.io/v1';
const GOOGLE_TTS_URL = 'https://translate.google.com/translate_tts';

const VOICES = {
  female: 'EXAVITQu4vr4xnSDxMaL',
  male:   'pNInz6obpgDQGcFmaJgB',
};

const isConfigured = () => !!process.env.ELEVENLABS_API_KEY?.startsWith('sk_');

const cleanText = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[^\w\s.,!?।]/g, '')
    .substring(0, 500);

/**
 * ElevenLabs TTS → returns base64 audio string
 */
const elevenLabsTTS = async (text, lang = 'hi') => {
  const voiceId = VOICES.female;
  const response = await axios.post(
    `${ELEVENLABS_URL}/text-to-speech/${voiceId}`,
    {
      text: cleanText(text),
      model_id: 'eleven_multilingual_v2',
      voice_settings: { stability: 0.65, similarity_boost: 0.75, style: 0.45 },
    },
    {
      headers: { 'xi-api-key': process.env.ELEVENLABS_API_KEY, Accept: 'audio/mpeg', 'Content-Type': 'application/json' },
      responseType: 'arraybuffer',
    }
  );
  const b64 = Buffer.from(response.data).toString('base64');
  return { audio: `data:audio/mpeg;base64,${b64}`, source: 'elevenlabs' };
};

/**
 * Google TTS URL (free fallback)
 */
const googleTTSUrl = (text, lang = 'hi') => {
  const clean = cleanText(text);
  const params = new URLSearchParams({ ie: 'UTF-8', q: clean, tl: lang, client: 'tw-ob' });
  return `${GOOGLE_TTS_URL}?${params.toString()}`;
};

/**
 * Main TTS function with fallback
 */
const textToSpeech = async (text, lang = 'hi') => {
  if (isConfigured()) {
    try {
      return await elevenLabsTTS(text, lang);
    } catch (err) {
      console.warn('[TTS] ElevenLabs failed, using Google fallback:', err.message);
    }
  }
  return { audio: googleTTSUrl(text, lang), source: 'google', isUrl: true };
};

module.exports = { textToSpeech, googleTTSUrl, isConfigured };
