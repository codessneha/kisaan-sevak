const router  = require('express').Router();
const multer  = require('multer');
const ctrl    = require('../controllers/speechController');
const { authMiddleware } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { ttsValidator } = require('../validators/aiValidator');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }); // 10 MB audio

router.use(authMiddleware);

// Speech-to-text
router.post('/transcribe',        upload.single('audio'), ctrl.transcribeFile);
router.post('/transcribe-base64', ctrl.transcribeB64);

// Text-to-speech
router.post('/tts', ttsValidator, validate, ctrl.tts);

module.exports = router;
