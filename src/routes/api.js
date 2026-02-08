import express from "express";
const router = express.Router();

import { AuthVerification } from "../middleware/authVerification.js";
import { AdminVerification } from "../middleware/adminVerification.js";

// Upload Controller
import { upload, UploadImage } from "../controller/upload.controller.js";

// Auth Controllers
import {
  Register, Login, GoogleAuth, ForgotPassword, VerifyForgotPasswordOTP,
  ResetPassword, SendLoginOTP, VerifyLoginOTP, Logout, GetProfile, UpdateProfile,
} from "../controller/auth.controller.js";

// Service Controllers
import {
  GetAllServices, GetServiceBySlug, AdminGetAllServices,
  CreateService, UpdateService, DeleteService,
} from "../controller/service.controller.js";

// Order Controllers
import {
  CreateOrder, GetMyOrders, GetOrderById, CancelOrder, GetDashboardStats,
  AdminGetAllOrders, AdminUpdateOrderStatus, AdminGetDashboardStats,
} from "../controller/order.controller.js";

// Coupon Controllers
import {
  GetActiveCoupons, ValidateCoupon,
  AdminGetAllCoupons, AdminCreateCoupon, AdminUpdateCoupon, AdminDeleteCoupon,
} from "../controller/coupon.controller.js";

// Review Controllers
import {
  CreateReview, GetMyReviews, UpdateMyReview, DeleteMyReview,
  GetApprovedReviews, AdminGetAllReviews, AdminUpdateReview, AdminDeleteReview,
} from "../controller/review.controller.js";

// Admin Controllers (Users, Payments, Reports, Settings)
import {
  AdminGetAllUsers, AdminUpdateUser,
  AdminGetPayments,
  AdminGetReports,
  AdminGetSettings, AdminUpdateSettings,
} from "../controller/admin.controller.js";

// ========== AUTH ROUTES ==========
router.post("/auth/register", Register);
router.post("/auth/login", Login);
router.post("/auth/google", GoogleAuth);
router.post("/auth/forgot-password", ForgotPassword);
router.post("/auth/verify-forgot-otp", VerifyForgotPasswordOTP);
router.post("/auth/reset-password", ResetPassword);
router.post("/auth/send-login-otp", SendLoginOTP);
router.post("/auth/verify-login-otp", VerifyLoginOTP);
router.post("/auth/logout", AuthVerification, Logout);
router.get("/auth/profile", AuthVerification, GetProfile);
router.put("/auth/profile", AuthVerification, UpdateProfile);

// ========== SERVICE ROUTES (Public) ==========
router.get("/services", GetAllServices);
router.get("/services/:slug", GetServiceBySlug);

// ========== ORDER ROUTES (User) ==========
router.post("/orders", AuthVerification, CreateOrder);
router.get("/orders/my-orders", AuthVerification, GetMyOrders);
router.get("/orders/dashboard-stats", AuthVerification, GetDashboardStats);
router.get("/orders/:id", AuthVerification, GetOrderById);
router.put("/orders/:id/cancel", AuthVerification, CancelOrder);

// ========== COUPON ROUTES (User) ==========
router.get("/coupons/active", AuthVerification, GetActiveCoupons);
router.post("/coupons/validate", AuthVerification, ValidateCoupon);

// ========== REVIEW ROUTES (Public & User) ==========
router.get("/reviews/approved", GetApprovedReviews);
router.post("/reviews", AuthVerification, CreateReview);
router.get("/reviews/my-reviews", AuthVerification, GetMyReviews);
router.put("/reviews/:id", AuthVerification, UpdateMyReview);
router.delete("/reviews/:id", AuthVerification, DeleteMyReview);

// ========== UPLOAD ROUTES ==========
router.post("/upload", AuthVerification, upload.single("image"), UploadImage);

// ========== ADMIN ROUTES ==========
// Admin - Dashboard
router.get("/admin/dashboard-stats", AuthVerification, AdminVerification, AdminGetDashboardStats);

// Admin - Services
router.get("/admin/services", AuthVerification, AdminVerification, AdminGetAllServices);
router.post("/admin/services", AuthVerification, AdminVerification, CreateService);
router.put("/admin/services/:id", AuthVerification, AdminVerification, UpdateService);
router.delete("/admin/services/:id", AuthVerification, AdminVerification, DeleteService);

// Admin - Orders
router.get("/admin/orders", AuthVerification, AdminVerification, AdminGetAllOrders);
router.put("/admin/orders/:id/status", AuthVerification, AdminVerification, AdminUpdateOrderStatus);

// Admin - Coupons
router.get("/admin/coupons", AuthVerification, AdminVerification, AdminGetAllCoupons);
router.post("/admin/coupons", AuthVerification, AdminVerification, AdminCreateCoupon);
router.put("/admin/coupons/:id", AuthVerification, AdminVerification, AdminUpdateCoupon);
router.delete("/admin/coupons/:id", AuthVerification, AdminVerification, AdminDeleteCoupon);

// Admin - Reviews
router.get("/admin/reviews", AuthVerification, AdminVerification, AdminGetAllReviews);
router.put("/admin/reviews/:id", AuthVerification, AdminVerification, AdminUpdateReview);
router.delete("/admin/reviews/:id", AuthVerification, AdminVerification, AdminDeleteReview);

// Admin - Users
router.get("/admin/users", AuthVerification, AdminVerification, AdminGetAllUsers);
router.put("/admin/users/:id", AuthVerification, AdminVerification, AdminUpdateUser);

// Admin - Payments
router.get("/admin/payments", AuthVerification, AdminVerification, AdminGetPayments);

// Admin - Reports
router.get("/admin/reports", AuthVerification, AdminVerification, AdminGetReports);

// Admin - Settings
router.get("/admin/settings", AuthVerification, AdminVerification, AdminGetSettings);
router.put("/admin/settings", AuthVerification, AdminVerification, AdminUpdateSettings);

export default router;
