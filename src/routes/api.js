import express from 'express';
import {
  Register,
  Login,
  GoogleAuth,
  ForgotPassword,
  VerifyForgotPasswordOTP,
  ResetPassword,
  SendLoginOTP,
  VerifyLoginOTP,
  Logout,
  GetProfile,
  UpdateProfile,
} from '../controller/auth.controller.js';
import { AuthVerification } from '../middleware/authVerification.js';

const router = express.Router();

// ==================== AUTH ROUTES ====================

// Public Routes (No authentication required)

// Register new user
// POST /api/v1/auth/register
// Body: { name, email, phone, password, confirmPassword }
router.post('/auth/register', Register);

// Login with email/phone and password
// POST /api/v1/auth/login
// Body: { emailOrPhone, password }
router.post('/auth/login', Login);

// Google Sign In / Sign Up
// POST /api/v1/auth/google
// Body: { idToken } (Firebase ID token from client)
router.post('/auth/google', GoogleAuth);

// Forgot Password - Send OTP
// POST /api/v1/auth/forgot-password
// Body: { emailOrPhone }
router.post('/auth/forgot-password', ForgotPassword);

// Verify Forgot Password OTP
// POST /api/v1/auth/verify-forgot-otp
// Body: { emailOrPhone, otp }
router.post('/auth/verify-forgot-otp', VerifyForgotPasswordOTP);

// Reset Password after OTP verification
// POST /api/v1/auth/reset-password
// Body: { emailOrPhone, newPassword, confirmPassword }
router.post('/auth/reset-password', ResetPassword);

// Send Login OTP (OTP based login)
// POST /api/v1/auth/send-login-otp
// Body: { emailOrPhone }
router.post('/auth/send-login-otp', SendLoginOTP);

// Verify Login OTP
// POST /api/v1/auth/verify-login-otp
// Body: { emailOrPhone, otp }
router.post('/auth/verify-login-otp', VerifyLoginOTP);

// Private Routes (Authentication required)

// Logout
// POST /api/v1/auth/logout
router.post('/auth/logout', AuthVerification, Logout);

// Get User Profile
// GET /api/v1/auth/profile
router.get('/auth/profile', AuthVerification, GetProfile);

// Update User Profile
// PUT /api/v1/auth/profile
// Body: { name, phone }
router.put('/auth/profile', AuthVerification, UpdateProfile);

export default router;