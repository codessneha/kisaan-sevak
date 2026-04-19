const express    = require('express');
const dotenv     = require('dotenv');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');

dotenv.config();

const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Boot ─────────────────────────────────────────────────────────────────────
connectDB();

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)
    : '*',
  credentials: true,
}));

// ── Rate limiting ─────────────────────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, try again later.' },
}));

app.use('/api/ai', rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'AI rate limit exceeded. Please wait.' },
}));

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Logger ────────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/users',     require('./routes/userRoutes'));
app.use('/api/crops',     require('./routes/cropRoutes'));
app.use('/api/loans',     require('./routes/loanRoutes'));
app.use('/api/insurance', require('./routes/insuranceRoutes'));
app.use('/api/weather',   require('./routes/weatherRoutes'));
app.use('/api/ai',        require('./routes/aiRoutes'));
app.use('/api/speech',    require('./routes/speechRoutes'));
app.use('/api/news',      require('./routes/newsRoutes'));
app.use('/api/market',    require('./routes/marketRoutes'));
app.use('/api/schemes',   require('./routes/schemeRoutes'));
app.use('/api/admin',     require('./routes/adminRoutes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) =>
  res.json({ status: 'OK', env: process.env.NODE_ENV, timestamp: new Date().toISOString() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Cannot ${req.method} ${req.originalUrl}` })
);

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── Listen ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`✅  KisaanSathi API  →  http://localhost:${PORT}  [${process.env.NODE_ENV || 'development'}]`)
);

module.exports = app;
