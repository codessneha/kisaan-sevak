# kisaan-sevak
🌾 KisaanSevak — AI-Powered Farmer Assistance Platform  A full-stack JavaScript monorepo that gives Indian farmers AI-powered crop advice, instant loan applications, insurance claims, disease diagnosis, market prices, and government scheme discovery — all in their native language.


## Table of Contents

1. [What is KisaanSevak?](#1-what-is-kisaansevak)
2. [How the System Works — Big Picture](#2-how-the-system-works--big-picture)
3. [Project Structure](#3-project-structure)
4. [Tech Stack](#4-tech-stack)
5. [Backend — Deep Dive](#5-backend--deep-dive)
6. [Frontend (Farmer App) — Deep Dive](#6-frontend-farmer-app--deep-dive)
7. [Admin Panel — Deep Dive](#7-admin-panel--deep-dive)
8. [AI & Intelligence Layer](#8-ai--intelligence-layer)
9. [Authentication Flow](#9-authentication-flow)
10. [Data Flow — Request Lifecycle](#10-data-flow--request-lifecycle)
11. [Database Schema](#11-database-schema)
12. [API Reference Summary](#12-api-reference-summary)
13. [Environment Variables](#13-environment-variables)
14. [Getting Started](#14-getting-started)
15. [Feature Walkthrough](#15-feature-walkthrough)

---

## 1. What is KisaanSathi?

KisaanSathi ("Farmer's Companion" in Hindi) is a platform built to solve real problems faced by small and marginal Indian farmers:

| Problem | KisaanSathi Solution |
|---|---|
| No access to crop advice | AI yield prediction using soil, season, and location |
| Crop diseases destroy yields | Photo-based plant disease diagnosis with treatment plans |
| Loan applications are complex | One-form loan application with instant AI risk scoring |
| Insurance claims get rejected | AI document analysis + fraud detection for fair claims |
| No visibility into market prices | Real-time mandi prices + AI price estimates |
| Government schemes are hard to find | Searchable scheme directory with direct apply links |
| Language barriers | Support for 8 Indian languages with voice input |

The platform has three parts that work together:

- **Backend API** — Node.js server that handles all business logic, AI calls, and data storage
- **Farmer App** — React web app that farmers use on their phones or computers
- **Admin Panel** — React dashboard where government officers and bank staff approve loans, review claims, and manage content

---

## 2. How the System Works — Big Picture

```
┌─────────────────────────────────────────────────────────────┐
│                        FARMER                               │
│                 (uses Farmer React App)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS requests with Firebase JWT
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API (Express)                     │
│                                                             │
│  Route → Validator → Controller → Service → Repository     │
│                                    │                        │
│              ┌─────────────────────┼──────────────┐        │
│              ▼                     ▼               ▼        │
│         MongoDB              Groq LLaMA AI    Open-Meteo   │
│         (data)               (intelligence)  (weather)     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS requests with Admin JWT
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  ADMIN PANEL (React)                        │
│         (used by bank staff / government officers)          │
└─────────────────────────────────────────────────────────────┘
```

**The two authentication systems** are intentionally separate:

- Farmers use **Firebase Authentication** — they sign up with email/phone and get a Firebase ID token. This token is sent with every API request and verified by the backend using Firebase Admin SDK.
- Admins use **JWT** — they log in with email + password stored in MongoDB (bcrypt hashed). The backend returns a signed JWT which the admin panel stores in localStorage.

This separation means a farmer can never access admin routes, and an admin JWT cannot be used to impersonate a farmer.

---

## 3. Project Structure

```
kisaan-sathi/                        ← Monorepo root
│
├── package.json                     ← Workspace root (npm workspaces)
│
├── backend/                         ← Node.js + Express API
│   ├── src/
│   │   ├── server.js                ← Entry point, mounts all routes
│   │   ├── config/
│   │   │   ├── db.js                ← MongoDB connection
│   │   │   └── firebase.js          ← Firebase Admin SDK init
│   │   ├── middleware/
│   │   │   ├── auth.js              ← Firebase + JWT auth middleware
│   │   │   ├── validate.js          ← express-validator error formatter
│   │   │   └── errorHandler.js      ← Global error handler
│   │   ├── models/                  ← Mongoose schemas (8 models)
│   │   ├── repositories/            ← Data access layer (9 repos)
│   │   ├── validators/              ← Input validation rules (6 files)
│   │   ├── services/                ← Business logic (16 services)
│   │   ├── controllers/             ← HTTP handlers (11 controllers)
│   │   ├── routes/                  ← Express routers (12 route files)
│   │   ├── utils/
│   │   │   └── aiPrompts.js         ← All 6 AI prompt templates
│   │   └── scripts/
│   │       └── seed.js              ← DB seeder (admin + schemes + prices)
│   ├── .env.example
│   └── package.json
│
├── frontend/                        ← React + Vite (Farmer App)
│   ├── src/
│   │   ├── main.jsx                 ← React root
│   │   ├── App.jsx                  ← Routes + auth guards
│   │   ├── utils/firebase.js        ← Firebase Web SDK init
│   │   ├── context/AuthContext.jsx  ← Firebase auth state + profile sync
│   │   ├── services/
│   │   │   ├── api.js               ← Axios with auto-token injection
│   │   │   └── endpoints.js         ← All API call functions
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx        ← 2-step: account + farm details
│   │   │   └── Dashboard.jsx        ← Main app shell + sidebar
│   │   └── components/
│   │       ├── common/              ← Spinner, StatusBadge
│   │       ├── dashboard/           ← DashboardOverview, ProfilePanel
│   │       └── features/            ← All 9 feature components
│   ├── .env.example
│   └── package.json
│
└── admin/                           ← React + Vite (Admin Panel)
    ├── src/
    │   ├── App.jsx                  ← Routes + auth guards
    │   ├── context/AuthContext.jsx  ← JWT auth with localStorage
    │   ├── services/
    │   │   ├── api.js               ← Axios with JWT injection
    │   │   └── endpoints.js         ← All admin API calls
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── AdminShell.jsx       ← Sidebar + nested routes
    │   │   ├── DashboardPage.jsx    ← Stats + Recharts charts
    │   │   ├── FarmersPage.jsx      ← Paginated farmer table
    │   │   ├── LoansPage.jsx        ← Full loan management
    │   │   ├── InsurancePage.jsx    ← Full claims management
    │   │   ├── SchemesPage.jsx      ← CRUD for govt schemes
    │   │   └── MarketPage.jsx       ← Add/update mandi prices
    │   └── components/common/      ← Spinner, StatusBadge, Pagination, ConfirmModal
    ├── .env.example
    └── package.json
```

---

## 4. Tech Stack

### Backend
| Category | Technology | Why |
|---|---|---|
| Runtime | Node.js 18+ | Fast, non-blocking I/O for concurrent AI calls |
| Framework | Express.js | Minimal, battle-tested HTTP framework |
| Database | MongoDB + Mongoose | Flexible schema for evolving agricultural data |
| Authentication | Firebase Admin SDK | Verify farmer tokens server-side |
| Admin Auth | JWT + bcryptjs | Stateless, secure admin sessions |
| AI / LLM | Groq SDK (LLaMA 3 / 4) | Free-tier LLaMA models for yield, disease, fraud AI |
| Speech-to-Text | Groq Whisper | `whisper-large-v3-turbo` for Hindi/regional speech |
| Text-to-Speech | ElevenLabs (+ Google fallback) | Multilingual voice responses |
| Weather | Open-Meteo API | Free, no-key 7-day forecasts |
| News | Serper API | Google News search for agricultural articles |
| Validation | express-validator | Declarative input validation chains |
| Security | Helmet + CORS + Rate limiting | Industry-standard hardening |

### Frontend & Admin
| Category | Technology | Why |
|---|---|---|
| Framework | React 18 | Component-based UI, hooks |
| Build tool | Vite | Instant HMR, fast production builds |
| Styling | Tailwind CSS v3 | Utility-first, agricultural color theme |
| Routing | React Router v6 | Nested routes, auth guards |
| HTTP client | Axios | Interceptors for automatic token injection |
| Auth | Firebase Web SDK | Email/password auth for farmers |
| Charts | Recharts | Bar + pie charts in admin dashboard |
| Toast | react-hot-toast | Non-intrusive notifications |

---

## 5. Backend — Deep Dive

### Layered Architecture

Every request flows through exactly four layers in order. No layer ever skips another.

```
HTTP Request
     │
     ▼
┌─────────────┐
│   ROUTE     │  Mounts validators + middleware + controller
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  VALIDATOR  │  express-validator rules (field types, ranges, enums)
│  + validate │  Returns 422 with structured errors if invalid
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ CONTROLLER  │  Reads req, calls service, sends res
│             │  Never contains business logic
│             │  Always passes errors to next()
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   SERVICE   │  All business logic lives here
│             │  Calls repositories + external services (AI, weather)
│             │  Throws typed errors with statusCode
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ REPOSITORY  │  All database queries live here
│             │  Extends BaseRepository (generic CRUD)
│             │  Returns plain objects (.lean())
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   MODEL     │  Mongoose schema definition only
│             │  No logic, no methods (except Admin.matchPassword)
└─────────────┘
```

### Models (8 schemas)

**User** — Farmer profile: name, phone, language (8 options), location (state/district/village/lat/lon), landSizeAcres, primaryCrop, soilType, Aadhaar, bank account. The `profileComplete` boolean is auto-set when key fields are filled.

**Crop** — One record per yield prediction. Stores the input (crop name, land size, soil type, irrigation, season) alongside the AI output (predictedYieldKgPerAcre, yieldCategory, soilHealthScore, climateScore, advisory, weatherRisk, suggestedCrops).

**Loan** — Full loan application with farmer data, requested amount, purpose, tenure, fraud fields (score 0–100, riskLevel, reason, riskFactors), eligibility fields (score, reasoning, predictedEligible), a featureVector array for similarity scoring, and an admin note field updated on approval/rejection.

**Insurance** — Insurance claim with provider, policy number, crop, claim amount, AI analysis (authenticityScore, damageConfidence, damagePrediction), fraud fields, eligibility fields, and an aiReasoning string explaining the decision.

**DiseaseReport** — One record per plant diagnosis. Stores crop name, symptoms, optional base64 image, AI output (diseaseName, severity, aiDiagnosis, treatment), and a `resolved` boolean the farmer can toggle.

**MarketPrice** — Crop price record with cropName, state, market, minPrice, maxPrice, modalPrice, unit, date. Indexed on (cropName, state, date) for fast latest-price queries.

**GovtScheme** — Government agricultural scheme with name, description, category (loan/insurance/subsidy/training/equipment/other), eligibility, benefit, applicationLink, states array (empty = all India), deadline, and isActive flag.

**Admin** — Admin account with name, email, bcrypt-hashed password (select: false by default), role (super_admin/admin/reviewer), isActive, and lastLogin timestamp.

### Services — Business Logic Examples

**loanService.applyLoan** — This is the most complex flow in the backend:
1. Fetches the farmer's profile from MongoDB to enrich the loan data with their real name, land size, and location — so the form stays short
2. Calls `fraudService.assessLoanFraud` which runs four heuristic checks (loan-to-land ratio, tenure plausibility, purpose validity, farmer profile completeness) then makes a Groq AI call for a fifth check, returns a combined 0–100 risk score
3. Calls `eligibilityService.predictLoanEligibility` which converts the loan data into a 6-dimension numeric feature vector, fetches the 50 most recent approved and 50 most recent rejected loans from the DB, calculates cosine similarity of the new vector against both sets, and produces an eligibility score adjusted for fraud penalty
4. Optionally calls Groq for a human-readable AI narrative summary of the application
5. Saves everything to MongoDB in a single create call

**diseaseService.diagnose** — Accepts an optional image (as a multipart file), converts it to base64, selects the vision model (`llama-4-maverick`) when an image is present, or the smart text model when only symptoms are described, calls Groq with a structured JSON prompt, parses the response, saves the diagnosis report, and returns both the saved record and the raw diagnosis object.

**marketService.getPrices** — First queries MongoDB for current prices. If no records exist for the requested crop + state, it falls back to asking Groq LLaMA to estimate reasonable current prices, clearly flagging the result as an AI estimate so farmers know it's approximate.

### Fraud Detection — Multi-Factor Scoring

The fraud system scores a loan on four factors that each contribute to a total 0–100 score:

1. **Loan-to-land ratio** (0–25 points) — ₹50k–200k per acre is normal. Above ₹400k/acre triggers high risk. Above ₹600k/acre triggers extreme risk with a detailed note.
2. **Profile completeness** (0–15 points) — Missing farmer name, land size, or crop type each add penalty points. Incomplete applications correlate with fraud in agricultural lending data.
3. **Tenure plausibility** (0–15 points) — Agricultural loans run 12–60 months. A 3-month tenure on a large loan is a red flag for quick-cash schemes.
4. **AI analysis** (0–25 points) — A prompt is sent to `llama-3.1-8b-instant` with all loan fields, asking for a JSON fraud score and list of red flags. The AI catches patterns the heuristics miss, like a stated crop type that doesn't match the loan purpose.

The total score maps to: LOW_RISK (< 40), MEDIUM_RISK (40–60), HIGH_RISK (60–80), EXTREME_RISK (> 80). High and extreme risk applications are flagged for mandatory manual review.

Insurance claims run through a parallel system that scores document authenticity, claim amount reasonableness, damage evidence confidence, and provider validity.

### Vector Similarity Eligibility

Instead of a hard-coded rules engine, the eligibility predictor learns from historical decisions. Each loan is converted into a 6-number vector: `[requestedAmount/1M, tenureMonths/12, landAcres/100, (100-fraudScore)/100, hashOf(cropType)%10, hashOf(purpose)%10]`. The new application's vector is compared to all previously approved loans and all previously rejected loans using cosine similarity. A high similarity to approved loans and low similarity to rejected loans produces a high eligibility score. This means the system gets smarter as more loans are processed.

---

## 6. Frontend (Farmer App) — Deep Dive

### Page Flow

```
Landing Page (/)
      │
      ├── Sign Up (/signup)  ←── 2-step form
      │         Step 1: Email, password, name, phone
      │         Step 2: State, district, land size, crop, soil, language
      │         On submit: Firebase createUser → POST /api/auth/register
      │
      └── Login (/login)
                │
                ▼
          Dashboard (/dashboard)
                │
                ├── DashboardOverview  (default tab)
                ├── CropForm           (yield prediction)
                ├── PlantDoctor        (disease diagnosis)
                ├── MarketPrices       (mandi prices)
                ├── LoanForm           (apply for loan)
                ├── MyLoans            (loan status tracker)
                ├── InsuranceForm      (file claim)
                ├── MyClaims           (claim status tracker)
                ├── GovtSchemes        (scheme browser)
                ├── NewsSection        (agri news)
                └── ProfilePanel       (edit profile)
```

### Authentication in the Frontend

`AuthContext.jsx` does three things on mount:

1. Calls Firebase's `onAuthStateChanged` — this fires whenever the user logs in or out
2. When a Firebase user is detected, it immediately calls `GET /api/users/profile` to load the MongoDB profile (which has farm details Firebase doesn't know about)
3. Stores both the Firebase user object and the MongoDB profile in context so any component can access them

The Axios instance in `services/api.js` uses a request interceptor that calls `user.getIdToken()` before every request. Firebase ID tokens expire after 1 hour, but `getIdToken()` silently refreshes them automatically. This means the farmer never gets logged out mid-session.

### Dashboard Design

The `Dashboard.jsx` is a shell component. It renders the sidebar and top bar, then renders whichever section component corresponds to the currently selected nav item. Navigation never triggers a page reload — it just changes a `useState` value called `active`, and the correct component renders in the main content area. This gives the app an SPA feel even on slow connections.

The sidebar collapses to an overlay drawer on mobile screens, detected via `lg:` breakpoint in Tailwind.

### The AI Chatbot

`ChatBot.jsx` floats as a fixed-position panel in the bottom-right corner of the dashboard. Key features:

**Voice input** — Uses the browser's `MediaRecorder` API to record audio, converts the WebM blob to base64, sends it to `POST /api/speech/transcribe-base64`, gets back a text transcript, and automatically sends that text as a chat message. This is critical for farmers who type slowly in regional languages.

**Language selector** — 8 language codes are shown as buttons in the chat header. Selecting a language passes it to the `/api/ai/chat` endpoint, which includes it in the prompt so the AI responds in that language.

**TTS playback** — A speaker button replays the last AI response. It calls `POST /api/speech/tts` which tries ElevenLabs multilingual-v2 first (high quality, supports Hindi), falls back to Google TTS URL if ElevenLabs isn't configured.

**Conversation starters** — Five pre-written questions appear when the chat is empty, so farmers know what they can ask.

### The Design System

`index.css` defines a set of utility classes on top of Tailwind's base. This means every component uses the same consistent building blocks:

- `.card` / `.card-header` / `.card-body` — white rounded containers with subtle borders
- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger` — button variants
- `.input` / `.label` — form elements
- `.badge` / `.badge-green` / `.badge-yellow` / `.badge-red` / `.badge-blue` — status indicators
- `.nav-item` / `.nav-item-active` — sidebar navigation items

The color palette uses real agricultural references: `primary` (#2C6E49 forest green), `sand` (#F5F0EC warm off-white), `soil` (#5C4033 earth brown), `stone` (#A89F91 muted gray), `wheat` (#C9B79C warm beige), `secondary` (#E4B363 harvest gold).

---

## 7. Admin Panel — Deep Dive

### What Admins Do

The admin panel is used by bank loan officers, insurance companies, and government agricultural department staff. Their workflow is:

1. **Log in** with the JWT-based email/password system (separate from Firebase)
2. **Check the dashboard** — see live counts of pending loans, claims under review, total farmers, approved amounts; two Recharts charts visualise loan status distribution and insurance claim breakdown; a bar chart shows farmer registrations by state
3. **Process loan applications** — the loans table shows every application with its fraud risk bar (red for high, yellow for medium, green for low), eligibility score, and status. Clicking a row expands it to show the full AI assessment, fraud factors, and a notes field. Approve or Reject opens a confirmation modal
4. **Review insurance claims** — same pattern: expandable rows show authenticity score, damage confidence score, eligibility score, AI reasoning. Approve or Reject with notes
5. **Manage government schemes** — full CRUD: create new schemes, edit existing ones (name, description, eligibility, benefit, link, deadline), delete schemes, toggle active/inactive
6. **Update market prices** — form to add today's mandi price for any crop in any state; farmers see these prices immediately

### How the Admin JWT Works

When an admin logs in, the backend calls `bcrypt.compare` to verify the password against the stored hash, then calls `jwt.sign` with a 7-day expiry and the admin's ID, email, and role embedded in the payload. The token is returned in the login response and stored in `localStorage`.

The Axios instance in the admin's `services/api.js` has a request interceptor that reads `localStorage.getItem('admin_token')` and adds it to every request header as `Authorization: Bearer <token>`. The backend's `adminAuth` middleware calls `jwt.verify` to validate it.

If a token is expired or invalid, the backend returns 401, and the Axios response interceptor catches this, clears localStorage, and redirects to the login page.

---

## 8. AI & Intelligence Layer

### Models Used

| Task | Groq Model | Reason |
|---|---|---|
| Yield prediction | `llama3-70b-8192` | Complex agronomic reasoning needs the bigger model |
| AI chatbot | `meta-llama/llama-4-maverick-17b-128e-instruct` | Best conversational quality, supports multilingual |
| Disease diagnosis (text) | `llama3-70b-8192` | Strong plant pathology knowledge |
| Disease diagnosis (image) | `meta-llama/llama-4-maverick-17b-128e-instruct` | Vision model, analyzes crop photos |
| Insurance claim analysis | `meta-llama/llama-4-maverick-17b-128e-instruct` | Vision model, reads policy documents |
| Fraud detection | `llama-3.1-8b-instant` | Fast, cheap, adequate for pattern detection |
| Market price estimates | `llama-3.1-8b-instant` | Simple factual retrieval |
| Speech-to-text | `whisper-large-v3-turbo` (Groq) | Best Hindi/regional language accuracy |

### All 6 AI Prompts (`utils/aiPrompts.js`)

All prompts live in one file and share a consistent pattern: they always ask for JSON output, define the exact schema, and include relevant farmer context. This makes responses predictable and parseable without regex hacks.

**yieldPrompt** — Sends soil type, crop name, irrigation method, season, land size, and location to the agronomist model. Expects: `predictedYieldKgPerAcre`, `yieldCategory`, `soilHealthScore`, `climateScore`, `weatherRisk`, `advisory`, and `suggestedCrops` array.

**diseasePrompt** — Describes the crop and symptoms (and optionally instructs the model to analyze an attached image). Expects: `diseaseName`, `severity`, `aiDiagnosis`, `treatment`, `prevention`, `urgency`.

**chatPrompt** — Builds a system prompt for Kisaan Saathi that includes the farmer's name, state, primary crop, land size, and preferred language. The model is instructed to be culturally aware, conversational, and to suggest platform features when relevant.

**loanSummaryPrompt** — Sends loan application data and fraud scores to generate a plain-English summary for admin review. Expects: `summary`, `recommendation`, `keyFactors`, `suggestedAmount`.

**insuranceSummaryPrompt** — Sends claim data (and optionally a base64 image) to produce an AI adjuster report. Expects: `authenticity_score`, `damage_confidence`, `damage_prediction`, `recommendation`, `reasoning`.

**farmSummaryPrompt** — Sends the farmer's full profile and recent crop history to generate a farm health report. Expects: `overallHealth`, `healthScore`, `strengths`, `concerns`, `topRecommendation`, `seasonalAdvice`.

### Calling Groq Safely

`services/groqService.js` exposes two functions:

- `callGroq(prompt, model, imageBase64)` — returns raw string response
- `callGroqJSON(prompt, model, imageBase64)` — extracts the first `{...}` block from the response and parses it as JSON, throwing if no valid JSON is found

All service files use `callGroqJSON` and wrap the call in try/catch. If the AI call fails, every service has a fallback — either a safe default object or a human-readable error message — so the core operation (saving a loan, filing a claim) always succeeds even if the AI is temporarily unavailable.

---

## 9. Authentication Flow

### Farmer Signup → First API Call

```
1. Farmer fills signup form (step 1: email/password, step 2: farm details)
2. Frontend calls Firebase createUserWithEmailAndPassword(email, password)
3. Firebase returns a credential with user.uid
4. Frontend immediately calls POST /api/auth/register with:
   { firebaseUid: user.uid, name, phone, language, landSizeAcres, ... }
5. Backend creates MongoDB User document linked by firebaseUid
6. Every subsequent API call: frontend calls user.getIdToken() → gets JWT
7. JWT sent in Authorization: Bearer <token> header
8. Backend middleware calls admin.auth().verifyIdToken(token)
9. Decoded uid attached to req.user.uid
10. Service/repository uses req.user.uid to scope all queries to that farmer
```

### Admin Login Flow

```
1. Admin enters email + password in admin panel
2. Frontend calls POST /api/admin/login
3. Backend: adminRepository.findByEmailWithPassword(email) — explicitly includes
   password field (it's select:false normally)
4. bcrypt.compare(enteredPassword, admin.password)
5. On match: jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' })
6. Token returned to frontend, stored in localStorage
7. Every admin request: token sent in Authorization header
8. Backend: jwt.verify(token, JWT_SECRET) — decoded admin attached to req.admin
9. Role checks can be applied per route (super_admin for admin creation, etc.)
```

---

## 10. Data Flow — Request Lifecycle

Here is a complete trace of what happens when a farmer submits a loan application:

```
POST /api/loans
Body: { cropType: "Wheat", loanPurpose: "Seeds", requestedAmount: 50000, tenureMonths: 12 }
Authorization: Bearer <firebase-id-token>

  1. Express router receives request
  2. authMiddleware fires: verifyIdToken(token) → req.user.uid = "firebase_abc123"
  3. applyLoanValidator runs: checks requestedAmount is between 1000–10000000,
     loanPurpose is one of the 10 valid enum values, etc.
  4. validate() middleware: no errors → calls next()
  5. loanController.applyLoan runs:
     - reads req.user.uid and req.body
     - calls loanService.applyLoan("firebase_abc123", body)
     - on success: sends 201 JSON response
  6. loanService.applyLoan:
     a. userRepository.findByFirebaseUid("firebase_abc123")
        → finds Farmer Ramesh, land=5 acres, location=West Bengal
     b. Builds enriched loanData with farmerName="Ramesh", landSizeAcres=5
     c. fraudService.assessLoanFraud(loanData):
        - Loan/land ratio: 50000/5 = ₹10,000/acre → LOW (score: 2)
        - Profile complete: all fields present → score: 0
        - Tenure 12 months: normal → score: 2
        - AI analysis: Groq returns fraud_score: 3, "Conservative loan request"
        - Total: 7 → LOW_RISK
     d. eligibilityService.predictLoanEligibility(loanData + fraudScore):
        - Creates vector: [0.05, 1.0, 0.05, 0.93, 7, 2]
        - Fetches 50 approved + 50 rejected loans from DB
        - Cosine similarity: 0.87 vs approved, 0.21 vs rejected
        - Score: 87 - (7×0.3) = 84.9 → predictedEligible: true
     e. groqService.callGroqJSON(loanSummaryPrompt): gets AI narrative
     f. loanRepository.create({ ...all fields, status: "PENDING" })
        → MongoDB document created with _id
  7. Response sent to farmer:
     { success: true, data: { _id, status: "PENDING", fraudRiskLevel: "LOW_RISK",
       eligibilityScore: 84.9, predictedEligible: true, ... } }
  8. Farmer sees: "Application Submitted! Eligibility: 84.9% — Low Risk"
```

---

## 11. Database Schema

### Indexes

All critical query fields are indexed:
- `User.firebaseUid` — unique index, used on every authenticated request
- `Loan.firebaseUid` — index for farmer-scoped loan queries
- `Insurance.firebaseUid` — index for farmer-scoped claim queries
- `Crop.firebaseUid` — index for farmer-scoped crop queries
- `DiseaseReport.firebaseUid` — index for farmer-scoped reports
- `MarketPrice.(cropName, state, date)` — compound index for price lookups
- `Admin.email` — unique index for login

### Relationships

MongoDB doesn't enforce foreign keys, but the codebase maintains logical relationships:
- `Loan.firebaseUid` → `User.firebaseUid` (linked by Firebase UID string)
- `Insurance.firebaseUid` → `User.firebaseUid`
- `Crop.firebaseUid` → `User.firebaseUid`
- `DiseaseReport.firebaseUid` → `User.firebaseUid`

When a loan is submitted, `loanService` fetches the User document and denormalises key fields (farmerName, landSizeAcres, farmLocation) directly into the Loan document. This is intentional — it means the loan record is self-contained and readable by admins without joining to the User collection.

---

## 12. API Reference Summary

All routes follow consistent patterns. `🔥` = Firebase token. `🔑` = Admin JWT.

| Domain | Method | Path | Auth | Description |
|---|---|---|---|---|
| Auth | POST | `/api/auth/register` | None | Register after Firebase signup |
| Auth | POST | `/api/auth/admin/login` | None | Admin login → returns JWT |
| Auth | GET | `/api/auth/me` | 🔥 | Get own Firebase profile |
| Users | GET | `/api/users/profile` | 🔥 | Get own MongoDB profile |
| Users | PUT | `/api/users/profile` | 🔥 | Update profile |
| Users | GET | `/api/users/` | 🔑 | All farmers (paginated) |
| Crops | POST | `/api/crops` | 🔥 | Add crop + AI yield prediction |
| Crops | GET | `/api/crops` | 🔥 | List own crops |
| Crops | DELETE | `/api/crops/:id` | 🔥 | Delete crop record |
| Loans | POST | `/api/loans` | 🔥 | Apply (fraud + eligibility AI) |
| Loans | GET | `/api/loans` | 🔥 | List own loans |
| Loans | GET | `/api/loans/admin/all` | 🔑 | All loans (paginated + filtered) |
| Loans | PUT | `/api/loans/admin/:id/status` | 🔑 | Approve / Reject |
| Insurance | POST | `/api/insurance` | 🔥 | File claim (+ image upload) |
| Insurance | GET | `/api/insurance` | 🔥 | List own claims |
| Insurance | GET | `/api/insurance/admin/all` | 🔑 | All claims |
| Insurance | PUT | `/api/insurance/admin/:id/status` | 🔑 | Update status |
| AI | POST | `/api/ai/chat` | 🔥 | Chat with Kisaan Saathi |
| AI | POST | `/api/ai/disease` | 🔥 | Diagnose plant disease |
| AI | GET | `/api/ai/farm-summary` | 🔥 | AI farm health report |
| Speech | POST | `/api/speech/transcribe-base64` | 🔥 | Audio → text (Whisper) |
| Speech | POST | `/api/speech/tts` | 🔥 | Text → audio (ElevenLabs) |
| Weather | GET | `/api/weather?lat=&lon=` | Optional | 7-day forecast |
| News | GET | `/api/news` | Optional | Agricultural news |
| Market | GET | `/api/market?crop=&state=` | Optional | Crop prices |
| Market | POST | `/api/market` | 🔑 | Add/update price |
| Schemes | GET | `/api/schemes` | Optional | Active schemes |
| Schemes | POST | `/api/schemes` | 🔑 | Create scheme |
| Schemes | PUT | `/api/schemes/:id` | 🔑 | Update scheme |
| Admin | GET | `/api/admin/dashboard` | 🔑 | Full dashboard stats |
| Admin | GET | `/api/admin/farmers` | 🔑 | All farmers |
| Admin | GET | `/api/admin/loans` | 🔑 | All loans |
| Admin | GET | `/api/admin/insurance` | 🔑 | All claims |

---

## 13. Environment Variables

### Backend (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/kisaansathi

# Firebase Admin SDK (from Firebase Console → Project Settings → Service Accounts)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project-id.iam.gserviceaccount.com

# AI
GROQ_API_KEY=gsk_your_groq_key

# Admin Panel JWT
JWT_SECRET=change-this-to-a-long-random-string-in-production
JWT_EXPIRE=7d

# Optional — for news feature
SERPER_API_KEY=your_serper_key

# Optional — for premium TTS (falls back to Google if not set)
ELEVENLABS_API_KEY=sk_your_elevenlabs_key

# For CORS in production
FRONTEND_URL=https://your-farmer-app.com
ADMIN_URL=https://your-admin-panel.com
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Admin (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 14. Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (free tier works)
- Firebase project with Email/Password auth enabled
- Groq API key (free at console.groq.com)

### Step 1 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, Firebase credentials, and Groq API key

npm install

# Creates: super admin account + 6 government schemes + 12 crop market prices
node src/scripts/seed.js

npm run dev
# Server running → http://localhost:5000
# Test: curl http://localhost:5000/health
```

### Step 2 — Farmer App

```bash
cd frontend
cp .env.example .env
# Edit .env with your Firebase web app config and API URL

npm install
npm run dev
# App running → http://localhost:5173
```

### Step 3 — Admin Panel

```bash
cd admin
cp .env.example .env
# Only needs: VITE_API_URL=http://localhost:5000/api

npm install
npm run dev
# Admin panel → http://localhost:5174
# Login: admin@kisaansathi.in / Admin@123456
# IMPORTANT: Change this password immediately after first login
```

### Production Deployment

The backend can be deployed to Railway, Render, or any Node.js host. The frontend and admin are static builds deployable to Vercel, Netlify, or any CDN:

```bash
# Build frontend
cd frontend && npm run build   # outputs to dist/

# Build admin
cd admin && npm run build      # outputs to dist/
```

---

## 15. Feature Walkthrough

### A farmer's typical session

**Registration** — Ramesh, a wheat farmer from Punjab, opens the app on his phone. He fills the 2-step signup: his name, phone, email, and password on step 1; his state (Punjab), district (Ludhiana), land size (8 acres), primary crop (Wheat), and soil type (loam) on step 2. He selects Punjabi (ਪੰਜਾਬੀ) as his language. The app creates his Firebase account and simultaneously saves his profile to MongoDB.

**Dashboard** — He sees a welcome message, an AI farm tip ("Consider applying nitrogen fertilizer in the next 2 weeks before peak growing season"), today's weather forecast for Ludhiana, and three pending loan records. He taps "Yield Prediction".

**Yield Prediction** — He enters Wheat, 8 acres, loam soil, flood irrigation, Rabi season. In about 3 seconds the app shows: Predicted yield: 2,400 kg/acre · Category: High · Soil score: 82 · Advisory: "Your soil health is good. Consider adding potassium-rich fertilizer to further improve yield. Avoid waterlogging during flowering stage."

**Loan Application** — He taps "Apply Loan". Selects Wheat as crop, Fertilizers as purpose, enters ₹80,000 and 12-month tenure. Submits. The app shows: "Application Submitted — Eligibility: 79% — Risk Level: LOW". His application goes to the admin panel.

**Plant Doctor** — He notices some yellow spots on his wheat leaves. He opens Plant Doctor, takes a photo, describes "yellow spots on leaves starting from edges". The AI responds: Disease: Wheat Rust (Yellow Rust) · Severity: Moderate · Treatment: Apply Propiconazole 25EC fungicide at 0.1% concentration. Repeat after 15 days. Remove heavily infected leaves.

**Chat** — He opens the AI chatbot and asks in Punjabi: "ਮੈਨੂੰ ਪ੍ਰਧਾਨ ਮੰਤਰੀ ਕਿਸਾਨ ਯੋਜਨਾ ਬਾਰੇ ਦੱਸੋ". The AI responds in Punjabi explaining PM-KISAN with the registration steps.

### An admin's typical session

**Dashboard** — Priya, a loan officer, logs in. She sees 23 pending loans worth ₹18.4L, 8 insurance claims under review. The bar chart shows the loan distribution: 23 pending, 145 approved, 12 rejected.

**Loan Review** — She clicks the Loans tab, filters by "PENDING". She sees Ramesh's application at the top. She clicks to expand it: fraud score 7/100 (LOW), eligibility 79%, AI summary "Conservative loan for wheat fertilizer. Low risk application from established farmer with 8 acres." She types an admin note "Approved — KCC limit verified" and clicks Approve. Ramesh immediately sees his loan status change to APPROVED in the farmer app.

**Scheme Management** — She adds a new state-specific subsidy scheme for Punjab farmers, fills the form with eligibility criteria and the government portal link. Farmers in Punjab now see it immediately in their Govt Schemes section.

---

## File Count Summary

| Part | Files | Production Build |
|---|---|---|
| Backend | 71 JS files | ✅ `node --check` passes all |
| Frontend | 25 JSX/JS files | ✅ Vite builds, 1588 modules |
| Admin | 18 JSX/JS files | ✅ Vite builds cleanly |
| **Total** | **114 files** | **All passing** |

---

*Built with JavaScript — Node.js, React, MongoDB, Firebase, and Groq AI.*
*Designed for Indian farmers. 🇮🇳*