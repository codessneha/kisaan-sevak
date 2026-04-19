const Groq = require('groq-sdk');

const MODELS = {
  fast:    'llama-3.1-8b-instant',
  smart:   'llama3-70b-8192',
  vision:  'meta-llama/llama-4-maverick-17b-128e-instruct',
};

let groqClient = null;

const getClient = () => {
  if (!groqClient) {
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groqClient;
};

/**
 * Call Groq LLM with optional image
 * @param {string} prompt
 * @param {string} model - use MODELS.fast / MODELS.smart / MODELS.vision
 * @param {string|null} imageBase64 - full data URI e.g. "data:image/jpeg;base64,..."
 * @returns {Promise<string>}
 */
const callGroq = async (prompt, model = MODELS.fast, imageBase64 = null) => {
  const groq = getClient();

  const content = imageBase64
    ? [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: imageBase64 } }]
    : prompt;

  const completion = await groq.chat.completions.create({
    model,
    messages: [{ role: 'user', content }],
    temperature: 0.7,
    max_completion_tokens: 1024,
  });

  return completion.choices[0]?.message?.content || '';
};

/**
 * Call Groq and parse the response as JSON
 * @param {string} prompt
 * @param {string} model
 * @param {string|null} imageBase64
 * @returns {Promise<Object>}
 */
const callGroqJSON = async (prompt, model = MODELS.fast, imageBase64 = null) => {
  const raw = await callGroq(prompt, model, imageBase64);
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Groq did not return valid JSON');
  return JSON.parse(match[0]);
};

module.exports = { callGroq, callGroqJSON, MODELS };
