# 🎨 Curtain AI AI Studio - Backend API Engine

The core backend service for **Curtain AI AI Studio**, an intelligent luxury curtain visualizer and fabric management platform. Built with **Node.js, Express.js, TypeScript, and MongoDB (Mongoose)**, this backend delivers AI-powered photorealistic room rendering using OpenAI, seamless Cloudinary media storage, robust JWT authentication, and comprehensive admin dashboard analytics.

---

## 🚀 Key Features

### 1. 🤖 AI Visualizer Engine (OpenAI Powered)
- **Model**: Powered by OpenAI's flagship **`gpt-image-2.5-sunburst`** with High-Quality (`quality: 'high'`) rendering.
- **Architectural Preservation Lock**: Proprietary inpainting prompt that guarantees walls, floors, mouldings, sofas, and ambient room lighting remain untouched while installing custom curtains over window geometries.
- **Customizable Drapery Attributes**: Supports dynamic drape lengths (floor-skimming, puddling, sill-length), arrangement positions (framing, semi-closed, closed), and architectural hardware tracks/rods.
- **Automatic Cloudinary Uploads**: Every AI-generated room visualization is automatically uploaded to Cloudinary for permanent, high-speed CDN delivery and stored in user visualization history.

### 2. 🪟 Curtains & Fabrics Catalog (MongoDB)
- **Categorization**: Full support for `curtains` (drapes), `sheers`, and `rollers`.
- **Search & Filtering**: Real-time filtering by category and fuzzy search across fabric names and materials.
- **URL & File Uploads**: Add and update curtains using direct image URLs or Base64 DataURLs (automatically synced to Cloudinary).
- **Automated Seeding**: Built-in endpoint (`/api/v1/curtains/seed`) to automatically populate the database from catalog data.

### 3. 🔐 Enterprise Authentication & RBAC
- **JWT Architecture**: Access tokens (7-day validity) and Refresh tokens (365-day validity).
- **Password Security**: Salted bcrypt hashing with 12 rounds.
- **Role-Based Access Control**: Strict `admin` vs `user` route guards.
- **Real SMTP Password Recovery**: Integration with Gmail SMTP for real HTML password reset emails.

### 4. 📊 Admin Dashboard Analytics
- Real-time aggregation of total registered users, active fabric styles, and recent AI room previews.
- Paginated user list with role indicators and timestamps.
- Admin profile management with customizable avatars, bio, location, and phone number.

---

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v20+)
- **Framework**: [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ORM](https://mongoosejs.com/)
- **AI Engine**: [OpenAI API](https://platform.openai.com/) (`gpt-image-2.5-sunburst`)
- **Media CDN**: [Cloudinary](https://cloudinary.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Mailing**: [Nodemailer](https://nodemailer.com/) (SMTP)
- **Security**: [Bcrypt.js](https://github.com/dcodeIO/bcrypt.js), [JSON Web Tokens (JWT)](https://jwt.io/), [CORS](https://github.com/expressjs/cors), [Dotenv](https://github.com/motdotla/dotenv)

---

## 📁 Directory Structure

```text
curtain-ai-backend/
├── src/
│   ├── app/
│   │   ├── config/             # Environment & service configurations
│   │   ├── errors/             # Custom AppError & global error handlers
│   │   ├── middlewares/        # Auth guards, request validation, global error middleware
│   │   ├── modules/
│   │   │   ├── Auth/           # Login, Register, Password Reset, Token Refresh
│   │   │   ├── curtain/        # Curtain model, controller, service, routes, validator
│   │   │   ├── dashboard/      # Admin overview statistics & metrics
│   │   │   ├── user/           # User profile management (/me) and user listings
│   │   │   └── visualizer/     # AI visualizer engine & room inpainting
│   │   ├── routes/             # Central router mapping (/api/v1)
│   │   └── utlis/              # Cloudinary upload helpers, sendEmail SMTP, catchAsync
│   ├── app.ts                  # Express application setup, CORS, parsers
│   └── server.ts               # Server startup & MongoDB database connection
├── Curtain AI_AI_Studio_Postman_Collection.json  # Comprehensive Postman collection
├── package.json
├── tsconfig.json
└── .env
```

---

## ⚙️ Environment Variables Configuration

Create a `.env` file in the root of `curtain-ai-backend`:

```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB
DATABASE_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/ai-curtain-studio?retryWrites=true&w=majority

# JWT Credentials
JWT_ACCESS_SECRET=your_jwt_access_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=365d
BCRYPT_SALT_ROUNDS=12

# OpenAI AI Visualizer
OPENAI_API_KEY=sk-proj-your-openai-api-key
IMAGE_MODEL=gpt-image-2.5-sunburst

# Cloudinary Media Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend Client URL (CORS)
CLIENT_URL=http://localhost:3000

# SMTP Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_google_app_password
EMAIL_FROM="Curtain AI AI Studio <your_email@gmail.com>"
```

---

## 📡 API Endpoints Reference

Base URL: `http://localhost:5000/api/v1`

### 1. Authentication (`/auth`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Public | Admin & user authentication, returns JWT access token |
| `POST` | `/auth/forgot-password` | Public | Sends password reset email via SMTP with secure token |
| `POST` | `/auth/reset-password` | Public | Resets user password using reset token |
| `POST` | `/auth/change-password` | Bearer Token | Authenticated user changes current password |
| `POST` | `/auth/refresh-token` | Public | Issues a new access token using refresh token |

### 2. User & Profile (`/users`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/users/create-user` | Public | Register a new user account |
| `GET` | `/users/me` | Bearer Token | Fetch authenticated user or admin profile |
| `PATCH` | `/users/me` | Bearer Token | Update admin profile details, avatar URL, or base64 photo |
| `GET` | `/users` | Admin Only | Get all registered users with pagination (`?page=1&limit=10`) |

### 3. Curtains & Fabrics (`/curtains`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/curtains` | Public | Fetch all fabrics (`?category=curtains\|sheers\|rollers&searchTerm=linen`) |
| `GET` | `/curtains/:id` | Public | Fetch single curtain fabric by ID |
| `POST` | `/curtains` | Admin Only | Create fabric (supports image URL or Base64 with auto Cloudinary sync) |
| `PATCH` | `/curtains/:id` | Admin Only | Update existing curtain information and images |
| `DELETE` | `/curtains/:id` | Admin Only | Soft delete a curtain item |
| `GET` | `/curtains/seed` | Public/Admin | Sync catalog data into MongoDB database |

### 4. AI Room Visualizer (`/visualizer`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/visualizer/generate` | Public/Auth | Renders custom curtain onto uploaded room photo using OpenAI |
| `GET` | `/visualizer/recent` | Public | Fetches recently generated AI visualizations |

### 5. Admin Dashboard (`/dashboard`)
| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/stats` | Admin Only | Overall platform KPIs: total users, fabrics count, AI previews |

---

## 📮 Postman Collection

Import the included Postman collection file:
```text
Curtain AI_AI_Studio_Postman_Collection.json
```
- Includes automatic script to capture and set `{{accessToken}}` upon login.
- Pre-populated with real test payloads for all categories and AI generation scenarios.

---

## 🚀 Getting Started

1. **Clone & Install Dependencies**:
   ```bash
   cd curtain-ai-backend
   pnpm install
   ```

2. **Run in Development Mode**:
   ```bash
   pnpm dev
   ```
   Server will start at `http://localhost:5000`.

3. **Build & Production Start**:
   ```bash
   pnpm build
   pnpm start
   ```

---

*Curtain AI AI Studio Backend — Engineering photorealistic interior experiences with AI precision.*

