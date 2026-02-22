import express from "express";
const router = express.Router();

import { AuthVerification } from "../middleware/authVerification.js";
import { AdminVerification } from "../middleware/adminVerification.js";
import { DeliveryVerification, StaffVerification } from "../middleware/roleVerification.js";

// Auth Controllers
import {
  Register, Login, GoogleAuth, ForgotPassword, VerifyForgotPasswordOTP,
  ResetPassword, SendLoginOTP, VerifyLoginOTP, Logout, GetProfile, UpdateProfile, ChangePassword,
} from "../controller/auth.controller.js";

// Service Controllers
import {
  GetAllServices, GetServiceBySlug, AdminGetAllServices,
  CreateService, UpdateService, DeleteService,
} from "../controller/service.controller.js";

// Order Controllers
import {
  CreateOrder, GetMyOrders, GetOrderById, CancelOrder, GetDashboardStats,
  AdminGetAllOrders, AdminGetOrderById, AdminUpdateOrderStatus, AdminGetDashboardStats,
  AdminAssignPickup, AdminAssignStaff, AdminAssignDelivery,
  AdminGetNearbyDeliveryBoys, AdminGetStaffList, AdminSettleEarnings,
} from "../controller/order.controller.js";

// Coupon Controllers
import {
  GetActiveCoupons, ValidateCoupon,
  AdminGetAllCoupons, AdminCreateCoupon, AdminUpdateCoupon, AdminDeleteCoupon,
} from "../controller/coupon.controller.js";

// Review Controllers
import {
  CreateReview, GetMyReviews, UpdateMyReview, DeleteMyReview,
  GetApprovedReviews, GetStoreReviews,
  AdminGetAllReviews, AdminUpdateReview, AdminDeleteReview,
} from "../controller/review.controller.js";

// Admin Controllers
import {
  AdminGetAllUsers, AdminUpdateUser, AdminCreateUser,
  AdminGetPayments,
  AdminGetReports,
  AdminGetSettings, AdminUpdateSettings,
  GetContactSettings, SubmitContactMessage, GetPublicSiteSettings,
  AdminGetNotifications, AdminMarkNotificationRead,
  GetUserNotifications, MarkUserNotificationRead,
  UploadToImgBB, imgbbUpload,
} from "../controller/admin.controller.js";

// Store Controllers
import {
  GetAllStores, GetNearbyStores, GetStoreBySlug,
  AdminGetAllStores, AdminCreateStore, AdminUpdateStore, AdminDeleteStore,
} from "../controller/store.controller.js";

// Delivery Controllers
import {
  DeliveryDashboardStats, DeliveryPickupOrders, DeliveryConfirmPickup,
  DeliveryAtWarehouse, DeliveryOutOrders, DeliveryStartDelivery,
  DeliveryConfirmDelivery, DeliveryCompletedOrders, DeliveryUpdateLocation,
  DeliveryEarnings,
} from "../controller/delivery.controller.js";

// Staff Controllers
import {
  StaffDashboardStats, StaffGetOrders, StaffStartCleaning,
  StaffCompleteCleaning, StaffGetOrderDetail,
} from "../controller/staff.controller.js";

// Ticket Controllers
import {
  CreateTicket, GetMyTickets, GetTicketDetail, AddTicketNote,
  StaffGetTickets, StaffUpdateTicket,
  AdminGetAllTickets, AdminGetTicketDetail, AdminUpdateTicket,
  AdminDeleteTicket, GetStaffForAssignment,
} from "../controller/ticket.controller.js";

// ========== PUBLIC ROUTES (No Auth) ==========
router.get("/public/contact-settings", GetContactSettings);
router.get("/public/site-settings", GetPublicSiteSettings);
router.post("/public/contact-message", SubmitContactMessage);

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
router.put("/auth/change-password", AuthVerification, ChangePassword);

// ========== SERVICE ROUTES (Public) ==========
router.get("/services", GetAllServices);
router.get("/services/:slug", GetServiceBySlug);

// ========== ORDER ROUTES (User) ==========
router.post("/orders", AuthVerification, CreateOrder);
router.get("/orders/my-orders", AuthVerification, GetMyOrders);
router.get("/orders/dashboard-stats", AuthVerification, GetDashboardStats);
router.get("/orders/:id", AuthVerification, GetOrderById);
router.put("/orders/:id/cancel", AuthVerification, CancelOrder);

// ========== COUPON ROUTES ==========
router.get("/coupons/active", AuthVerification, GetActiveCoupons);
router.post("/coupons/validate", AuthVerification, ValidateCoupon);

// ========== REVIEW ROUTES ==========
router.get("/reviews/approved", GetApprovedReviews);
router.get("/reviews/store/:storeId", GetStoreReviews);
router.post("/reviews", AuthVerification, CreateReview);
router.get("/reviews/my-reviews", AuthVerification, GetMyReviews);
router.put("/reviews/:id", AuthVerification, UpdateMyReview);
router.delete("/reviews/:id", AuthVerification, DeleteMyReview);

// ========== STORE ROUTES (Public) ==========
router.get("/stores", GetAllStores);
router.get("/stores/nearby", GetNearbyStores);
router.get("/stores/:slug", GetStoreBySlug);

// ========== DELIVERY ROUTES ==========
router.get("/delivery/dashboard-stats", AuthVerification, DeliveryVerification, DeliveryDashboardStats);
router.get("/delivery/pickup-orders", AuthVerification, DeliveryVerification, DeliveryPickupOrders);
router.put("/delivery/pickup/:id", AuthVerification, DeliveryVerification, DeliveryConfirmPickup);
router.put("/delivery/warehouse/:id", AuthVerification, DeliveryVerification, DeliveryAtWarehouse);
router.get("/delivery/out-orders", AuthVerification, DeliveryVerification, DeliveryOutOrders);
router.put("/delivery/start-delivery/:id", AuthVerification, DeliveryVerification, DeliveryStartDelivery);
router.put("/delivery/confirm-delivery/:id", AuthVerification, DeliveryVerification, DeliveryConfirmDelivery);
router.get("/delivery/completed", AuthVerification, DeliveryVerification, DeliveryCompletedOrders);
router.put("/delivery/location", AuthVerification, DeliveryVerification, DeliveryUpdateLocation);
router.get("/delivery/earnings", AuthVerification, DeliveryVerification, DeliveryEarnings);

// ========== STAFF ROUTES ==========
router.get("/staff/dashboard-stats", AuthVerification, StaffVerification, StaffDashboardStats);
router.get("/staff/orders", AuthVerification, StaffVerification, StaffGetOrders);
router.put("/staff/orders/:id/start-cleaning", AuthVerification, StaffVerification, StaffStartCleaning);
router.put("/staff/orders/:id/complete-cleaning", AuthVerification, StaffVerification, StaffCompleteCleaning);
router.get("/staff/orders/:id", AuthVerification, StaffVerification, StaffGetOrderDetail);

// ========== ADMIN ROUTES ==========
router.get("/admin/dashboard-stats", AuthVerification, AdminVerification, AdminGetDashboardStats);

// Admin - Services
router.get("/admin/services", AuthVerification, AdminVerification, AdminGetAllServices);
router.post("/admin/services", AuthVerification, AdminVerification, CreateService);
router.put("/admin/services/:id", AuthVerification, AdminVerification, UpdateService);
router.delete("/admin/services/:id", AuthVerification, AdminVerification, DeleteService);

// Admin - Orders
router.get("/admin/orders", AuthVerification, AdminVerification, AdminGetAllOrders);
router.get("/admin/orders/:id", AuthVerification, AdminVerification, AdminGetOrderById);
router.put("/admin/orders/:id/status", AuthVerification, AdminVerification, AdminUpdateOrderStatus);
router.put("/admin/orders/:id/assign-pickup", AuthVerification, AdminVerification, AdminAssignPickup);
router.put("/admin/orders/:id/assign-staff", AuthVerification, AdminVerification, AdminAssignStaff);
router.put("/admin/orders/:id/assign-delivery", AuthVerification, AdminVerification, AdminAssignDelivery);

// Admin - Delivery Boys & Staff
router.get("/admin/delivery-boys", AuthVerification, AdminVerification, AdminGetNearbyDeliveryBoys);
router.get("/admin/staff-list", AuthVerification, AdminVerification, AdminGetStaffList);
router.put("/admin/settle-earnings/:deliveryBoyId", AuthVerification, AdminVerification, AdminSettleEarnings);

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
router.post("/admin/users", AuthVerification, AdminVerification, AdminCreateUser);

// Admin - Payments
router.get("/admin/payments", AuthVerification, AdminVerification, AdminGetPayments);

// Admin - Reports
router.get("/admin/reports", AuthVerification, AdminVerification, AdminGetReports);

// Admin - Settings
router.get("/admin/settings", AuthVerification, AdminVerification, AdminGetSettings);
router.put("/admin/settings", AuthVerification, AdminVerification, AdminUpdateSettings);

// Admin - Stores
router.get("/admin/stores", AuthVerification, AdminVerification, AdminGetAllStores);
router.post("/admin/stores", AuthVerification, AdminVerification, AdminCreateStore);
router.put("/admin/stores/:id", AuthVerification, AdminVerification, AdminUpdateStore);
router.delete("/admin/stores/:id", AuthVerification, AdminVerification, AdminDeleteStore);

// ========== TICKET / SUPPORT TOKEN ROUTES ==========
// User - Tickets
router.post("/tickets", AuthVerification, CreateTicket);
router.get("/tickets/my-tickets", AuthVerification, GetMyTickets);
router.get("/tickets/:id", AuthVerification, GetTicketDetail);
router.post("/tickets/:id/notes", AuthVerification, AddTicketNote);

// Staff - Tickets
router.get("/staff/tickets", AuthVerification, StaffVerification, StaffGetTickets);
router.put("/staff/tickets/:id", AuthVerification, StaffVerification, StaffUpdateTicket);

// Admin - Tickets
router.get("/admin/tickets", AuthVerification, AdminVerification, AdminGetAllTickets);
router.get("/admin/tickets/staff-list", AuthVerification, AdminVerification, GetStaffForAssignment);
router.get("/admin/tickets/:id", AuthVerification, AdminVerification, AdminGetTicketDetail);
router.put("/admin/tickets/:id", AuthVerification, AdminVerification, AdminUpdateTicket);
router.delete("/admin/tickets/:id", AuthVerification, AdminVerification, AdminDeleteTicket);

// ========== NOTIFICATION ROUTES ==========
// Admin
router.get("/admin/notifications", AuthVerification, AdminVerification, AdminGetNotifications);
router.put("/admin/notifications/:id/read", AuthVerification, AdminVerification, AdminMarkNotificationRead);

// User
router.get("/notifications", AuthVerification, GetUserNotifications);
router.put("/notifications/:id/read", AuthVerification, MarkUserNotificationRead);

// ========== IMGBB UPLOAD ==========
router.post("/upload/imgbb", AuthVerification, imgbbUpload.single("image"), UploadToImgBB);

export default router;
