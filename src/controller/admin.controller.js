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
