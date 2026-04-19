const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');

const MIME_TO_EXT = {
  'audio/webm': 'webm', 'audio/wav': 'wav',
  'audio/mp3': 'mp3',   'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',   'audio/flac': 'flac',
  'audio/m4a': 'm4a',
};

const transcribeBuffer = async (audioBuffer, filename, language = null) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const tmpPath = path.join(os.tmpdir(), `ks_audio_${Date.now()}_${filename}`);

  try {
    fs.writeFileSync(tmpPath, audioBuffer);
    const result = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-large-v3-turbo',
      language: language || undefined,
      response_format: 'verbose_json',
    });
    return { text: result.text || '', language: result.language || 'unknown', duration: result.duration || 0 };
  } finally {
    if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
  }
};

const transcribeBase64 = async (base64Audio, mimeType = 'audio/webm', language = null) => {
  const raw = base64Audio.includes(',') ? base64Audio.split(',')[1] : base64Audio;
  const buffer = Buffer.from(raw, 'base64');
  const ext = MIME_TO_EXT[mimeType] || 'webm';
  return transcribeBuffer(buffer, `recording.${ext}`, language);
};

module.exports = { transcribeBuffer, transcribeBase64 };
