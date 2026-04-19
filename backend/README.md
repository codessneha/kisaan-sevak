# KisaanSathi — Backend API

Node.js + Express + MongoDB REST API for the KisaanSathi farmer assistance platform.

## Architecture

```
src/
├── config/          DB + Firebase Admin init
├── middleware/       auth (Firebase + JWT), errorHandler, validate
├── models/          Mongoose schemas
├── repositories/    Data-access layer (BaseRepository + feature repos)
├── validators/      express-validator chains (one file per domain)
├── services/        Business logic (one file per domain)
├── controllers/     HTTP request/response handlers (thin layer)
├── routes/          Express routers (validation → controller)
├── utils/           AI prompts, helpers
└── scripts/         seed.js
```

**Request lifecycle:**

```
Route → Validator → validate middleware → Controller → Service → Repository → Model
```

## Setup

```bash
cp .env.example .env      # fill in your keys
npm install
node src/scripts/seed.js  # creates super admin + sample data
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `FIREBASE_PRIVATE_KEY` | ✅ | Firebase Admin private key |
| `FIREBASE_CLIENT_EMAIL` | ✅ | Firebase Admin client email |
| `GROQ_API_KEY` | ✅ | Groq LLaMA API key |
| `JWT_SECRET` | ✅ | Secret for admin JWT signing |
| `SERPER_API_KEY` | ⚠️ | For agricultural news (optional) |
| `ELEVENLABS_API_KEY` | ⚠️ | Premium TTS (falls back to Google) |
| `PORT` | ❌ | Default: 5000 |
| `JWT_EXPIRE` | ❌ | Default: 7d |

## API Reference

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register after Firebase sign-up |
| POST | `/api/auth/admin/login` | None | Admin login → returns JWT |
| GET  | `/api/auth/me` | 🔥 Firebase | Get own profile |

### Users
| Method | Path | Auth | Description |
|---|---|---|---|
| GET  | `/api/users/profile` | 🔥 | Get own profile |
| PUT  | `/api/users/profile` | 🔥 | Update own profile |
| GET  | `/api/users/` | 🔑 Admin | List all farmers (paginated) |
| GET  | `/api/users/stats` | 🔑 Admin | Farmer stats by state |

### Crops
| Method | Path | Auth | Description |
|---|---|---|---|
| POST   | `/api/crops` | 🔥 | Add crop + AI yield prediction |
| GET    | `/api/crops` | 🔥 | List own crops |
| GET    | `/api/crops/:id` | 🔥 | Get single crop record |
| DELETE | `/api/crops/:id` | 🔥 | Delete crop record |

### Loans
| Method | Path | Auth | Description |
|---|---|---|---|
| POST   | `/api/loans` | 🔥 | Apply for loan (fraud + eligibility AI) |
| GET    | `/api/loans` | 🔥 | List own loans |
| GET    | `/api/loans/:id` | 🔥 | Get loan detail |
| GET    | `/api/loans/admin/all` | 🔑 | All loans (paginated, filterable) |
| GET    | `/api/loans/admin/stats` | 🔑 | Loan stats by status |
| PUT    | `/api/loans/admin/:id/status` | 🔑 | Approve / Reject / Review |
| DELETE | `/api/loans/admin/:id` | 🔑 | Delete loan |

### Insurance
| Method | Path | Auth | Description |
|---|---|---|---|
| POST   | `/api/insurance` | 🔥 | File claim (optional image upload) |
| GET    | `/api/insurance` | 🔥 | List own claims |
| GET    | `/api/insurance/:id` | 🔥 | Get claim detail |
| GET    | `/api/insurance/admin/all` | 🔑 | All claims (paginated) |
| GET    | `/api/insurance/admin/stats` | 🔑 | Claim stats |
| PUT    | `/api/insurance/admin/:id/status` | 🔑 | Update claim status |
| DELETE | `/api/insurance/admin/:id` | 🔑 | Delete claim |

### AI
| Method | Path | Auth | Description |
|---|---|---|---|
| POST  | `/api/ai/chat` | 🔥 | Chat with Kisaan Saathi AI |
| POST  | `/api/ai/disease` | 🔥 | Diagnose plant disease (optional image) |
| GET   | `/api/ai/disease` | 🔥 | List own disease reports |
| PATCH | `/api/ai/disease/:id/resolve` | 🔥 | Mark disease resolved |
| GET   | `/api/ai/farm-summary` | 🔥 | AI farm health summary |

### Speech
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/speech/transcribe` | 🔥 | STT — multipart audio file |
| POST | `/api/speech/transcribe-base64` | 🔥 | STT — base64 audio |
| POST | `/api/speech/tts` | 🔥 | TTS — text → audio |

### Weather
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/weather?lat=&lon=` | Optional | 7-day forecast (Open-Meteo) |

### News
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/news` | Optional | Latest agri news |
| GET | `/api/news/insights?location=&crops=` | Optional | Farm insights |

### Market Prices *(NEW)*
| Method | Path | Auth | Description |
|---|---|---|---|
| GET  | `/api/market?crop=&state=` | Optional | Current prices (DB or AI estimate) |
| GET  | `/api/market/history?crop=&state=&days=` | Optional | Price history |
| POST | `/api/market` | 🔑 Admin | Add/update prices |

### Government Schemes *(NEW)*
| Method | Path | Auth | Description |
|---|---|---|---|
| GET    | `/api/schemes?category=&state=&search=` | Optional | List active schemes |
| GET    | `/api/schemes/admin/all` | 🔑 | All schemes (admin) |
| POST   | `/api/schemes` | 🔑 | Create scheme |
| PUT    | `/api/schemes/:id` | 🔑 | Update scheme |
| DELETE | `/api/schemes/:id` | 🔑 | Delete scheme |

### Admin Panel
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/login` | None | Admin login |
| POST | `/api/admin/create` | 🔑 | Create admin account |
| GET  | `/api/admin/dashboard` | 🔑 | Full dashboard stats |
| GET  | `/api/admin/farmers` | 🔑 | All farmers |
| GET  | `/api/admin/loans` | 🔑 | All loans |
| PUT  | `/api/admin/loans/:id/status` | 🔑 | Update loan status |
| GET  | `/api/admin/insurance` | 🔑 | All claims |
| PUT  | `/api/admin/insurance/:id/status` | 🔑 | Update claim status |

---

🔥 = Firebase ID token in `Authorization: Bearer <token>`  
🔑 = Admin JWT in `Authorization: Bearer <token>`
