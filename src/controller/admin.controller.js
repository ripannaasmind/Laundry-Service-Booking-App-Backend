import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import multer from "multer";

import User from "../model/user.model.js";
import Order from "../model/order.model.js";
import Settings from "../model/settings.model.js";

// ========== USER MANAGEMENT ==========

// GET /admin/users - Get all users with pagination, search, role filter
export const AdminGetAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, status, search } = req.query;
    const query = {};

    if (role && role !== 'all') {
      query.role = role;
    }
    if (status === 'blocked') {
      query.isBlocked = true;
    } else if (status === 'active') {
      query.isBlocked = { $ne: true };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Get order stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await Order.aggregate([
          { $match: { user: user._id } },
          { $group: { _id: null, totalOrders: { $sum: 1 }, totalSpent: { $sum: "$totalPayment" } } },
        ]);
        const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0 };
        return {
          ...user.toObject(),
          orders: stats.totalOrders,
          totalSpent: stats.totalSpent,
        };
      })
    );

    res.status(200).json({
      status: "success",
      data: usersWithStats,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// PUT /admin/users/:id - Update user (role, block/unblock)
export const AdminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isBlocked } = req.body;
    const update = {};
    if (role !== undefined) update.role = role;
    if (isBlocked !== undefined) update.isBlocked = isBlocked;

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ status: "fail", message: "User not found" });

    res.status(200).json({ status: "success", data: user });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== PAYMENT / TRANSACTION OVERVIEW ==========

// GET /admin/payments - Get payment overview from orders
export const AdminGetPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, method } = req.query;
    const query = {};
    if (status && status !== 'all') query.paymentStatus = status;
    if (method && method !== 'all') query.paymentMethod = method;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'name email profileImage')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const payments = orders.map((o) => ({
      _id: o._id,
      orderId: o.orderId,
      user: o.user,
      amount: o.totalPayment,
      method: o.paymentMethod,
      status: o.paymentStatus,
      date: o.createdAt,
    }));

    // Stats
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPayment" },
          totalOrders: { $sum: 1 },
          completedPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] },
          },
          pendingPayments: {
            $sum: { $cond: [{ $eq: ["$paymentStatus", "pending"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      status: "success",
      data: payments,
      stats: stats[0] || { totalRevenue: 0, totalOrders: 0, completedPayments: 0, pendingPayments: 0 },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== REPORTS ==========

// GET /admin/reports - Get report data
export const AdminGetReports = async (req, res) => {
  try {
    const { period = 'month' } = req.query;

    // Determine date range
    const now = new Date();
    let startDate;
    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else {
      startDate = new Date(0); // All time
    }

    // Revenue stats
    const revenueStats = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalPayment" },
          totalOrders: { $sum: 1 },
          avgOrderValue: { $avg: "$totalPayment" },
        },
      },
    ]);

    // Revenue by service (from items)
    const serviceRevenue = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.serviceName",
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { revenue: -1 } },
      { $limit: 10 },
    ]);

    // Top customers
    const topCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$totalPayment" },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          name: "$userInfo.name",
          email: "$userInfo.email",
          totalSpent: 1,
          orderCount: 1,
          avgOrder: { $divide: ["$totalSpent", "$orderCount"] },
        },
      },
    ]);

    // New customers in period
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate },
    });

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const stats = revenueStats[0] || { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    res.status(200).json({
      status: "success",
      data: {
        revenue: {
          total: stats.totalRevenue,
          totalOrders: stats.totalOrders,
          avgOrderValue: stats.avgOrderValue,
        },
        serviceRevenue,
        topCustomers,
        newCustomers,
        statusBreakdown,
        period,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== SETTINGS ==========

// GET /admin/settings - Get all settings
export const AdminGetSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    // Convert to key-value object
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Return with defaults if empty
    const defaults = {
      siteName: 'UltraWash',
      tagline: 'Professional Laundry Service',
      email: 'support@ultrawash.com',
      phone: '+1 234 567 8900',
      address: '123 Main Street, New York, NY 10001',
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'America/New_York',
      workingHoursStart: '08:00',
      workingHoursEnd: '20:00',
      minOrderAmount: 15,
      taxRate: 8.5,
      freeDeliveryThreshold: 50,
      deliveryFee: 5.99,
      deliveryRadius: 15,
      enableSMS: true,
      enableEmail: true,
      enablePush: true,
      enableStripe: true,
      enableCashOnDelivery: true,
      enableWallet: false,
      maintenanceMode: false,
    };

    res.status(200).json({
      status: "success",
      data: { ...defaults, ...settingsObj },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// PUT /admin/settings - Update settings
export const AdminUpdateSettings = async (req, res) => {
  try {
    const settingsToUpdate = req.body;
    const operations = Object.entries(settingsToUpdate).map(([key, value]) => ({
      updateOne: {
        filter: { key },
        update: { $set: { key, value } },
        upsert: true,
      },
    }));

    await Settings.bulkWrite(operations);

    // Return updated settings
    const settings = await Settings.find({});
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    res.status(200).json({
      status: "success",
      data: settingsObj,
      message: "Settings updated successfully",
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== CONTACT PAGE SETTINGS (Public) ==========

// GET /public/contact-settings - Get contact page settings (no auth needed)
export const GetContactSettings = async (req, res) => {
  try {
    const Settings = (await import("../model/settings.model.js")).default;
    const setting = await Settings.findOne({ key: "contactPageData" });
    
    // Default contact page data
    const defaults = {
      heroTitle: "Get in Touch",
      heroSubtitle: "Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      contactInfo: [
        {
          type: "phone",
          title: "Phone",
          details: ["Main: (239) 555-0108", "Support: (239) 555-0109"],
          link: "tel:+12395550108",
        },
        {
          type: "email",
          title: "Email",
          details: ["info@ultrawash.com", "support@ultrawash.com"],
          link: "mailto:info@ultrawash.com",
        },
        {
          type: "address",
          title: "Address",
          details: ["2118 Thornridge Cir, Syracuse", "New York, NY 13210"],
          link: "https://maps.google.com",
        },
        {
          type: "hours",
          title: "Business Hours",
          details: ["Mon - Sat: 8:00 AM - 8:00 PM", "Sunday: 10:00 AM - 6:00 PM"],
          link: null,
        },
      ],
      locations: [
        {
          name: "Downtown Location",
          address: "2118 Thornridge Cir, Syracuse, NY",
          phone: "(239) 555-0108",
          hours: "Mon-Sat: 8AM-8PM",
        },
        {
          name: "Westside Location",
          address: "3461 Whittier Ave, Syracuse, NY",
          phone: "(239) 555-0109",
          hours: "Mon-Sat: 8AM-8PM",
        },
        {
          name: "Eastside Location",
          address: "4234 Lighthouse Ln, Syracuse, NY",
          phone: "(239) 555-0110",
          hours: "Mon-Sat: 8AM-8PM",
        },
      ],
      mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2915.5474545454545!2d-76.147!3d43.0481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDPCsDAyJzUzLjIiTiA3NsKwMDgnNDkuMiJX!5e0!3m2!1sen!2sus!4v1234567890",
      faqTitle: "Need Quick Answers?",
      faqSubtitle: "Check out our FAQ page for instant answers to common questions about our services, pricing, and more.",
      faqButtonText: "Visit FAQ Section",
    };

    res.status(200).json({
      status: "success",
      data: setting ? setting.value : defaults,
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// POST /public/contact-message - Submit contact form message
export const SubmitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ status: "fail", message: "Name, email, and message are required" });
    }

    // Store in a ContactMessage collection (create if not exists)
    const mongoose = (await import("mongoose")).default;
    
    // Define schema inline if model doesn't exist
    let ContactMessage;
    try {
      ContactMessage = mongoose.model("ContactMessage");
    } catch {
      const schema = new mongoose.Schema({
        name: String,
        email: String,
        phone: String,
        subject: String,
        message: String,
        status: { type: String, default: "unread", enum: ["unread", "read", "replied"] },
      }, { timestamps: true });
      ContactMessage = mongoose.model("ContactMessage", schema);
    }

    const msg = await ContactMessage.create({ name, email, phone, subject, message });
    
    res.status(201).json({
      status: "success",
      message: "Message sent successfully! We'll get back to you soon.",
      data: msg,
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== PUBLIC SITE SETTINGS (Footer, Logo, etc.) ==========

// GET /public/site-settings - Get site settings for footer/header (no auth)
export const GetPublicSiteSettings = async (req, res) => {
  try {
    const settings = await Settings.find({});
    const settingsObj = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    // Return only public-safe fields with defaults
    const result = {
      siteName: settingsObj.siteName || 'Ultra Wash',
      tagline: settingsObj.tagline || 'Premium Laundry & Dry Cleaning',
      email: settingsObj.email || 'support@ultrawash.com',
      phone: settingsObj.phone || '+1 234 567 8900',
      address: settingsObj.address || '123 Main Street, New York, NY 10001',
      currency: settingsObj.currency || 'USD',
      currencySymbol: settingsObj.currencySymbol || '$',
      // Footer specific
      footerLogo: settingsObj.footerLogo || '',
      footerDescription: settingsObj.footerDescription || 'Your clothes deserve the best—trust Ultra Wash for professional care, eco-friendly solutions, and a spotless finish.',
      copyrightText: settingsObj.copyrightText || '© {year} Ultra Wash. All Rights Reserved.',
      facebookUrl: settingsObj.facebookUrl || '',
      twitterUrl: settingsObj.twitterUrl || '',
      instagramUrl: settingsObj.instagramUrl || '',
      linkedinUrl: settingsObj.linkedinUrl || '',
      youtubeUrl: settingsObj.youtubeUrl || '',
      playStoreUrl: settingsObj.playStoreUrl || '',
      appStoreUrl: settingsObj.appStoreUrl || '',
      // Header specific
      headerLogo: settingsObj.headerLogo || '',
      // Payment settings (public)
      codEnabled: settingsObj.codEnabled !== undefined ? settingsObj.codEnabled : true,
      stripeEnabled: settingsObj.stripeEnabled !== undefined ? settingsObj.stripeEnabled : true,
      paypalEnabled: settingsObj.paypalEnabled !== undefined ? settingsObj.paypalEnabled : true,
      walletEnabled: settingsObj.walletEnabled !== undefined ? settingsObj.walletEnabled : true,
      paystackEnabled: settingsObj.paystackEnabled !== undefined ? settingsObj.paystackEnabled : true,
      // Footer quick links (dynamic)
      footerQuickLinks: settingsObj.footerQuickLinks || [],
      // Social media & app download links (dynamic)
      socialMediaLinks: settingsObj.socialMediaLinks || [],
      appDownloadLinks: settingsObj.appDownloadLinks || [],
    };

    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== ADMIN CREATE USER (Staff/Delivery) ==========

// POST /admin/users - Create new user (delivery boy, staff, etc.)
export const AdminCreateUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: "fail", message: "Name, email, and password are required" });
    }

    const validRoles = ["user", "delivery", "staff", "admin"];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ status: "fail", message: "Invalid role" });
    }

    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ status: "fail", message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || undefined,
      password: hashedPassword,
      role: role || "user",
      isVerified: true,
    });

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== NOTIFICATIONS ==========

// Notification schema (inline)
let Notification;
try {
  Notification = mongoose.model("Notification");
} catch {
  const notifSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    role: { type: String, enum: ["admin", "user", "delivery", "staff", "all"], default: "admin" },
    type: { type: String, enum: ["order", "payment", "delivery", "system", "review", "ticket"], default: "system" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    orderId: { type: String, default: null },
    isRead: { type: Boolean, default: false },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  }, { timestamps: true });
  notifSchema.index({ role: 1, isRead: 1, createdAt: -1 });
  notifSchema.index({ user: 1, isRead: 1, createdAt: -1 });
  Notification = mongoose.model("Notification", notifSchema);
}

// Helper to create notification
export const createNotification = async ({ user, role, type, title, message, orderId, metadata }) => {
  try {
    await Notification.create({ user, role: role || "admin", type: type || "system", title, message, orderId, metadata });
  } catch (e) {
    console.error("Failed to create notification:", e.message);
  }
};

// GET /admin/notifications - Get admin notifications
export const AdminGetNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30, unreadOnly } = req.query;
    const query = { role: { $in: ["admin", "all"] } };
    if (unreadOnly === "true") query.isRead = false;

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ role: { $in: ["admin", "all"] }, isRead: false });

    res.status(200).json({
      status: "success",
      data: { notifications, unreadCount, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// PUT /admin/notifications/:id/read - Mark notification as read
export const AdminMarkNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === "all") {
      await Notification.updateMany({ role: { $in: ["admin", "all"] }, isRead: false }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.status(200).json({ status: "success", message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// GET /notifications - Get user notifications
export const GetUserNotifications = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const { page = 1, limit = 30 } = req.query;
    const query = { $or: [{ user: userId }, { role: "all" }] };

    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const unreadCount = await Notification.countDocuments({ ...query, isRead: false });

    res.status(200).json({
      status: "success",
      data: { notifications, unreadCount, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// PUT /notifications/:id/read - Mark user notification as read
export const MarkUserNotificationRead = async (req, res) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    if (id === "all") {
      await Notification.updateMany({ $or: [{ user: userId }, { role: "all" }], isRead: false }, { isRead: true });
    } else {
      await Notification.findByIdAndUpdate(id, { isRead: true });
    }
    res.status(200).json({ status: "success", message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};

// ========== IMGBB UPLOAD ==========


const memoryStorage = multer.memoryStorage();
const imgbbFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  cb(null, allowed.includes(file.mimetype));
};
export const imgbbUpload = multer({ storage: memoryStorage, fileFilter: imgbbFileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
// POST /upload/imgbb - Upload image to ImgBB
export const UploadToImgBB = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ status: "fail", message: "No file uploaded" });

    // Get ImgBB API key from settings or use default demo key
    const settingsDoc = await Settings.findOne({ key: "imgbbApiKey" });
    const apiKey = settingsDoc?.value || "6d207e02198a847aa98d0a2a901485a5"; // demo key

    const base64Image = req.file.buffer.toString("base64");

    const formData = new URLSearchParams();
    formData.append("key", apiKey);
    formData.append("image", base64Image);
    formData.append("name", req.file.originalname || "upload");

    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      res.status(200).json({
        status: "success",
        data: {
          url: data.data.display_url,
          deleteUrl: data.data.delete_url,
          thumbnail: data.data.thumb?.url || data.data.display_url,
        },
      });
    } else {
      res.status(400).json({ status: "fail", message: "Failed to upload to ImgBB" });
    }
  } catch (err) {
    res.status(500).json({ status: "fail", message: err.message });
  }
};
