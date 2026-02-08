import Order from "../model/order.model.js";
import Coupon from "../model/coupon.model.js";

export const CreateOrderService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { items, address, notes, couponCode, paymentMethod } = req.body;
    if (!items || items.length === 0) return { status: "failed", message: "Items are required" };

    let subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true, expiryDate: { $gt: new Date() } });
      if (coupon && subtotal >= coupon.minOrderValue && coupon.usedCount < coupon.usageLimit) {
        discount = coupon.discountType === "percentage"
          ? Math.min(subtotal * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
          : coupon.discountValue;
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    const totalPayment = subtotal - discount;
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const itemsSummary = items.map(i => `${i.quantity} ${i.serviceName}`).join(", ");
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);

    const order = await Order.create({
      user: userId, items, itemCount, itemsSummary,
      subtotal, discount, totalPayment, couponCode: couponCode || null,
      paymentMethod: paymentMethod || "card", paymentStatus: "paid",
      deliveryDate, address: address || "", notes: notes || "",
      trackingSteps: [
        { title: "Order Confirmed", date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }), status: "completed" },
        { title: "Picked Up", status: "pending" },
        { title: "In Process", status: "pending" },
        { title: "Shipped", status: "pending" },
        { title: "Delivered", status: "pending" },
      ],
      status: "confirmed",
    });

    return { status: "success", message: "Order placed successfully", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const GetMyOrdersService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { status } = req.query;
    const filter = { user: userId };
    
    if (status && status !== "all") {
      if (status === "ongoing") filter.status = { $nin: ["delivered", "cancelled"] };
      else if (status === "completed") filter.status = "delivered";
      else if (status === "cancelled") filter.status = "cancelled";
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    return { status: "success", data: orders };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const GetOrderByIdService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) return { status: "failed", message: "Order not found" };
    return { status: "success", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const CancelOrderService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, user: userId });
    if (!order) return { status: "failed", message: "Order not found" };
    if (["delivered", "cancelled"].includes(order.status)) return { status: "failed", message: "Cannot cancel this order" };

    order.status = "cancelled";
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (step.status === "completed") return step;
      return { ...step.toObject(), status: "cancelled", date: "-" };
    });
    await order.save();
    return { status: "success", message: "Order cancelled", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const GetDashboardStatsService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const orders = await Order.find({ user: userId });
    const totalOrders = orders.length;
    const activeOrders = orders.filter(o => !["delivered", "cancelled"].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === "delivered").length;
    const cancelledOrders = orders.filter(o => o.status === "cancelled").length;
    const latestOrders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(5);
    
    return {
      status: "success",
      data: { totalOrders, activeOrders, completedOrders, cancelledOrders, latestOrders },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin
export const AdminGetAllOrdersService = async (req) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const orders = await Order.find(filter).populate("user", "name email phone").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    return { status: "success", data: { orders, total, page: parseInt(page), totalPages: Math.ceil(total / limit) } };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const AdminUpdateOrderStatusService = async (req) => {
  try {
    const { id } = req.params;
    const { status: newStatus } = req.body;
    const order = await Order.findById(id);
    if (!order) return { status: "failed", message: "Order not found" };

    const statusFlow = ["confirmed", "picked_up", "in_process", "ready", "out_for_delivery", "delivered"];
    const stepMap = { confirmed: 0, picked_up: 1, in_process: 2, ready: 2, out_for_delivery: 3, delivered: 4 };

    order.status = newStatus;
    if (stepMap[newStatus] !== undefined) {
      order.trackingSteps = order.trackingSteps.map((step, i) => {
        if (i < stepMap[newStatus]) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : step.date };
        if (i === stepMap[newStatus]) return { ...step.toObject(), status: "current", date: new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) };
        return { ...step.toObject(), status: "pending" };
      });
    }
    if (newStatus === "delivered") {
      order.trackingSteps = order.trackingSteps.map(step => ({ ...step.toObject(), status: "completed", date: step.date === "Pending" ? new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : step.date }));
    }

    await order.save();
    return { status: "success", message: "Order status updated", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const AdminGetDashboardStatsService = async () => {
  try {
    const totalOrders = await Order.countDocuments();
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todaysOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
    const totalRevenue = await Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalPayment" } } }]);
    const pendingOrders = await Order.countDocuments({ status: { $nin: ["delivered", "cancelled"] } });
    const completedOrders = await Order.countDocuments({ status: "delivered" });
    const cancelledOrders = await Order.countDocuments({ status: "cancelled" });
    const recentOrders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5);

    return {
      status: "success",
      data: {
        totalOrders, todaysOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders, completedOrders, cancelledOrders, recentOrders,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
