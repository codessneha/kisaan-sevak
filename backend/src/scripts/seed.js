/**
 * Seed Script
 * Run once: node src/scripts/seed.js
 *
 * Creates:
 *   - Default super admin account
 *   - Sample government schemes
 *   - Sample market prices
 */

require('dotenv').config();
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const Admin      = require('../models/Admin');
const GovtScheme = require('../models/GovtScheme');
const MarketPrice = require('../models/MarketPrice');

const SCHEMES = [
  {
    name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
    description: 'Direct income support of ₹6,000 per year to farmer families in three equal instalments.',
    category: 'subsidy',
    eligibility: 'All small and marginal farmers with cultivable land up to 2 hectares.',
    benefit: '₹6,000 per year in three instalments of ₹2,000 each.',
    applicationLink: 'https://pmkisan.gov.in/',
    states: [],
    isActive: true,
  },
  {
    name: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Crop insurance scheme providing financial support to farmers suffering crop loss/damage due to unforeseen events.',
    category: 'insurance',
    eligibility: 'All farmers including sharecroppers and tenant farmers growing notified crops.',
    benefit: 'Insurance coverage and financial support for crop losses. Premium as low as 2% for Kharif, 1.5% for Rabi.',
    applicationLink: 'https://pmfby.gov.in/',
    states: [],
    isActive: true,
  },
  {
    name: 'Kisan Credit Card (KCC)',
    description: 'Provides farmers with timely and adequate credit support from the banking system for their cultivation needs.',
    category: 'loan',
    eligibility: 'All farmers — individual or joint borrowers who are owner-cultivators.',
    benefit: 'Revolving credit facility up to ₹3 lakh at subsidised interest rates (7% p.a.).',
    applicationLink: 'https://www.nabard.org/',
    states: [],
    isActive: true,
  },
  {
    name: 'Soil Health Card Scheme',
    description: 'Provides information to farmers on nutrient status of their soil along with recommendations on dosage of nutrients required.',
    category: 'other',
    eligibility: 'All farmers across India.',
    benefit: 'Free soil testing and personalised nutrient recommendations every 2 years.',
    applicationLink: 'https://soilhealth.dac.gov.in/',
    states: [],
    isActive: true,
  },
  {
    name: 'PM Kisan Maan Dhan Yojana',
    description: 'Voluntary and contributory pension scheme for small and marginal farmers.',
    category: 'other',
    eligibility: 'Small and marginal farmers aged 18-40 years with cultivable land up to 2 hectares.',
    benefit: 'Monthly pension of ₹3,000 after attaining the age of 60 years.',
    applicationLink: 'https://maandhan.in/',
    states: [],
    isActive: true,
  },
  {
    name: 'Agriculture Infrastructure Fund (AIF)',
    description: 'Financing facility for investment in post-harvest management infrastructure and community farming assets.',
    category: 'loan',
    eligibility: 'Farmers, FPOs, PACS, Agri-entrepreneurs, Start-ups.',
    benefit: 'Loans up to ₹2 crore with 3% interest subvention for 7 years.',
    applicationLink: 'https://agriinfra.dac.gov.in/',
    states: [],
    isActive: true,
  },
];

const MARKET_PRICES = [
  { cropName: 'Rice',       state: 'West Bengal',    market: 'Kolkata',   minPrice: 1800, maxPrice: 2200, modalPrice: 2000, unit: 'quintal' },
  { cropName: 'Wheat',      state: 'Punjab',         market: 'Ludhiana',  minPrice: 2000, maxPrice: 2400, modalPrice: 2200, unit: 'quintal' },
  { cropName: 'Wheat',      state: 'Haryana',        market: 'Karnal',    minPrice: 1950, maxPrice: 2350, modalPrice: 2150, unit: 'quintal' },
  { cropName: 'Maize',      state: 'Bihar',          market: 'Patna',     minPrice: 1400, maxPrice: 1800, modalPrice: 1600, unit: 'quintal' },
  { cropName: 'Sugarcane',  state: 'Uttar Pradesh',  market: 'Lucknow',   minPrice: 310,  maxPrice: 360,  modalPrice: 335,  unit: 'quintal' },
  { cropName: 'Cotton',     state: 'Maharashtra',    market: 'Nagpur',    minPrice: 5800, maxPrice: 6500, modalPrice: 6100, unit: 'quintal' },
  { cropName: 'Onion',      state: 'Maharashtra',    market: 'Nashik',    minPrice: 800,  maxPrice: 1800, modalPrice: 1200, unit: 'quintal' },
  { cropName: 'Potato',     state: 'Uttar Pradesh',  market: 'Agra',      minPrice: 600,  maxPrice: 1200, modalPrice: 900,  unit: 'quintal' },
  { cropName: 'Tomato',     state: 'Karnataka',      market: 'Bengaluru', minPrice: 400,  maxPrice: 2000, modalPrice: 1000, unit: 'quintal' },
  { cropName: 'Soybean',    state: 'Madhya Pradesh', market: 'Indore',    minPrice: 3800, maxPrice: 4400, modalPrice: 4100, unit: 'quintal' },
  { cropName: 'Mustard',    state: 'Rajasthan',      market: 'Jaipur',    minPrice: 4800, maxPrice: 5400, modalPrice: 5100, unit: 'quintal' },
  { cropName: 'Groundnut',  state: 'Gujarat',        market: 'Rajkot',    minPrice: 4500, maxPrice: 5200, modalPrice: 4800, unit: 'quintal' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ── Admin ──────────────────────────────────────────────────────────────────
    const existingAdmin = await Admin.findOne({ email: 'admin@kisaansathi.in' });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Super Admin',
        email: 'admin@kisaansathi.in',
        password: 'Admin@123456',   // ← CHANGE THIS IN PRODUCTION
        role: 'super_admin',
      });
      console.log('✅ Super admin created → admin@kisaansathi.in  /  Admin@123456');
    } else {
      console.log('ℹ️  Super admin already exists');
    }

    // ── Govt Schemes ───────────────────────────────────────────────────────────
    const schemeCount = await GovtScheme.countDocuments();
    if (schemeCount === 0) {
      await GovtScheme.insertMany(SCHEMES);
      console.log(`✅ ${SCHEMES.length} government schemes seeded`);
    } else {
      console.log(`ℹ️  Schemes already seeded (${schemeCount} found)`);
    }

    // ── Market Prices ──────────────────────────────────────────────────────────
    const priceCount = await MarketPrice.countDocuments();
    if (priceCount === 0) {
      await MarketPrice.insertMany(MARKET_PRICES.map(p => ({ ...p, source: 'seed' })));
      console.log(`✅ ${MARKET_PRICES.length} market prices seeded`);
    } else {
      console.log(`ℹ️  Market prices already seeded (${priceCount} found)`);
    }

    console.log('\n🎉 Seed complete!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();
