const { transcribeBuffer, transcribeBase64 } = require('../services/speechService');
const { textToSpeech }                        = require('../services/ttsService');

/** POST /api/speech/transcribe   (multipart audio file) */
const transcribeFile = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No audio file provided' });
    const { language } = req.body;
    const result = await transcribeBuffer(req.file.buffer, req.file.originalname, language);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

/** POST /api/speech/transcribe-base64   (JSON body with base64 audio) */
const transcribeB64 = async (req, res, next) => {
  try {
    const { audio, mimeType, language } = req.body;
    if (!audio) return res.status(400).json({ success: false, message: 'No audio data provided' });
    const result = await transcribeBase64(audio, mimeType, language);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

/** POST /api/speech/tts */
const tts = async (req, res, next) => {
  try {
    const { text, language } = req.body;
    const result = await textToSpeech(text, language || 'hi');
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

module.exports = { transcribeFile, transcribeB64, tts };
