# 🧺 Ultra Wash — Laundry Service Booking App Backend

A RESTful API backend for a laundry service booking application. Built with **Node.js**, **Express**, **MongoDB**, and **Firebase**.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Server & REST API |
| MongoDB + Mongoose | Database |
| Firebase Admin SDK | Google OAuth & push notifications |
| JWT | Authentication |
| Twilio | SMS OTP |
| Brevo (Sendinblue) | Email OTP |
| Multer + ImgBB | Image uploads |

---

## 📁 Project Structure

```
src/
├── config/         # DB, Firebase config
├── controller/     # Route handlers
├── middleware/     # Auth, role verification
├── model/          # Mongoose schemas
├── routes/         # API routes
├── service/        # Business logic
└── utils/          # Email, SMS, token helpers
```

---

## ⚙️ Setup & Installation

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Twilio](https://console.twilio.com/) account (for SMS OTP)
- [Brevo](https://app.brevo.com/) account (for Email OTP)
- [Firebase](https://console.firebase.google.com/) project (for Google login)

### 2. Clone the Repository

```bash
git clone https://github.com/ripannaastech/Laundry-Service-Booking-App-Backend.git
cd Laundry-Service-Booking-App-Backend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `3000`) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `BREVO_SMTP_USER` | Brevo SMTP login email |
| `BREVO_SMTP_KEY` | Brevo SMTP password/key |
| `EMAIL_FROM` | Sender email address |
| `TWILIO_ACCOUNT_SID` | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token |
| `TWILIO_PHONE_NUMBER` | Twilio phone number (E.164 format) |
| `FIREBASE_ADMIN_PROJECT_ID` | Firebase project ID |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Firebase service account private key |

> 📌 **Firebase Admin SDK:** Go to Firebase Console → Project Settings → Service Accounts → Generate New Private Key

### 5. Run the Server

**Production:**
```bash
npm start
```

**Development (with auto-reload):**
```bash
npm run dev
```

Server will start at: `http://localhost:3000`

---

## 📡 API Base URL

```
http://localhost:3000/api/v1
```

---

## 🔑 Authentication

Most endpoints require a **Bearer token** in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📋 Main API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/phone & password |
| POST | `/auth/google` | Google OAuth login |
| POST | `/auth/send-login-otp` | Send OTP to email or phone |
| POST | `/auth/verify-login-otp` | Verify OTP and get token |
| POST | `/auth/forgot-password` | Send password reset OTP |
| POST | `/auth/verify-forgot-otp` | Verify reset OTP |
| POST | `/auth/reset-password` | Set new password |
| GET | `/auth/profile` | Get logged-in user profile |
| PUT | `/auth/profile` | Update profile |

### Services
| Method | Endpoint | Description |
|---|---|---|
| GET | `/services` | Get all available services |
| GET | `/services/:slug` | Get service by slug |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Create new order |
| GET | `/orders/my-orders` | Get my orders |
| GET | `/orders/:id` | Get order details |
| PUT | `/orders/:id/cancel` | Cancel an order |

### Stores
| Method | Endpoint | Description |
|---|---|---|
| GET | `/stores` | Get all stores |
| GET | `/stores/nearby` | Get nearby stores |
| GET | `/stores/:slug` | Get store details |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/dashboard-stats` | Dashboard statistics |
| GET | `/admin/orders` | All orders |
| GET | `/admin/users` | All users |
| POST | `/admin/services` | Create service |
| POST | `/admin/stores` | Create store |

> See `API-DOCUMENTATION.md` for the full API reference.

---

## 👥 User Roles

| Role | Description |
|---|---|
| `user` | Regular customer |
| `admin` | Full system access |
| `staff` | Laundry staff (cleaning) |
| `delivery` | Delivery personnel |

---

## 🔒 Security Notes

- Never commit your `.env` file — it is listed in `.gitignore`
- Use `.env.example` as a template for required variables
- Firebase service account JSON files are excluded from git
- JWT tokens expire in 24 hours by default

---

## 🌱 Seed Data

To populate the database with initial data:

```bash
node src/seed.js
```

-----

## 📄 License

ISC


