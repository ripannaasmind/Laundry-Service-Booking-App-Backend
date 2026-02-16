import Order from "../model/order.model.js";
import User from "../model/user.model.js";
import Coupon from "../model/coupon.model.js";

const formatDate = () => new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

export const CreateOrderService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { items, address, notes, couponCode, paymentMethod, latitude, longitude, billingInfo, shippingInfo, schedule, deliveryType, deliverySpeedCharge } = req.body;
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

    const speedCharge = deliverySpeedCharge || 0;
    const totalPayment = subtotal - discount + speedCharge;
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const itemsSummary = items.map(i => `${i.quantity} ${i.serviceName}`).join(", ");
    let deliveryDate;
    if (schedule && schedule.deliveryDate) {
      deliveryDate = new Date(schedule.deliveryDate + "T00:00:00");
    } else {
      deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 5);
    }

    const order = await Order.create({
      user: userId, items, itemCount, itemsSummary,
      subtotal, discount, totalPayment, couponCode: couponCode || null,
      paymentMethod: paymentMethod || "card", paymentStatus: "paid",
      deliveryDate, address: address || "", notes: notes || "",
      billingInfo: billingInfo || {},
      shippingInfo: shippingInfo || {},
      schedule: schedule || {},
      deliveryType: deliveryType || "standard",
      deliverySpeedCharge: speedCharge,
      customerLocation: latitude && longitude ? { type: "Point", coordinates: [longitude, latitude] } : undefined,
      trackingSteps: [
        { title: "Order Confirmed", date: formatDate(), status: "completed" },
        { title: "Pickup Assigned", status: "pending" },
        { title: "Picked Up", status: "pending" },
        { title: "At Warehouse", status: "pending" },
        { title: "Cleaning In Progress", status: "pending" },
        { title: "Cleaned & Ready", status: "pending" },
        { title: "Out for Delivery", status: "pending" },
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
    const order = await Order.findOne({ _id: id, user: userId })
      .populate("pickupDeliveryBoy", "name phone")
      .populate("assignedStaff", "name")
      .populate("deliveryBoy", "name phone");
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
    if (["delivered", "cancelled", "in_process", "cleaned"].includes(order.status)) return { status: "failed", message: "Cannot cancel this order" };

    order.status = "cancelled";
    order.trackingSteps = order.trackingSteps.map((step) => {
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

// ====== ADMIN ======

export const AdminGetAllOrdersService = async (req) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    const orders = await Order.find(filter)
      .populate("user", "name email phone")
      .populate("pickupDeliveryBoy", "name phone")
      .populate("assignedStaff", "name phone")
      .populate("deliveryBoy", "name phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Order.countDocuments(filter);
    return { status: "success", data: { orders, total, page: parseInt(page), totalPages: Math.ceil(total / limit) } };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const AdminUpdateOrderStatusService = async (req) => {
  try {
    const { id } = req.params;
    const { status: newStatus, pickupCharge, deliveryCharge } = req.body;
    const order = await Order.findById(id);
    if (!order) return { status: "failed", message: "Order not found" };

    order.status = newStatus;
    if (pickupCharge !== undefined) order.pickupCharge = pickupCharge;
    if (deliveryCharge !== undefined) order.deliveryCharge = deliveryCharge;

    const statusToStep = {
      confirmed: 0, pickup_assigned: 1, picked_up: 2, at_warehouse: 3,
      in_process: 4, cleaned: 5, delivery_assigned: 5, ready: 5,
      out_for_delivery: 6, delivered: 7,
    };

    const stepIdx = statusToStep[newStatus];
    if (stepIdx !== undefined) {
      order.trackingSteps = order.trackingSteps.map((step, i) => {
        if (i < stepIdx) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
        if (i === stepIdx) return { ...step.toObject(), status: "current", date: formatDate() };
        return { ...step.toObject(), status: "pending" };
      });
    }
    if (newStatus === "delivered") {
      order.trackingSteps = order.trackingSteps.map(step => ({ ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date }));
    }

    await order.save();
    return { status: "success", message: "Order status updated", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin assign pickup delivery boy
export const AdminAssignPickupService = async (req) => {
  try {
    const { id } = req.params;
    const { deliveryBoyId, pickupCharge } = req.body;
    
    const order = await Order.findById(id);
    if (!order) return { status: "failed", message: "Order not found" };
    
    const deliveryBoy = await User.findOne({ _id: deliveryBoyId, role: "delivery" });
    if (!deliveryBoy) return { status: "failed", message: "Delivery boy not found" };
    
    order.pickupDeliveryBoy = deliveryBoyId;
    order.pickupAssignedAt = new Date();
    order.status = "pickup_assigned";
    if (pickupCharge) order.pickupCharge = pickupCharge;
    
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (i === 0) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
      if (i === 1) return { ...step.toObject(), status: "current", date: formatDate() };
      return step.toObject();
    });
    
    await order.save();
    return { status: "success", message: "Pickup delivery boy assigned", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin assign staff for cleaning
export const AdminAssignStaffService = async (req) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;
    
    const order = await Order.findById(id);
    if (!order) return { status: "failed", message: "Order not found" };
    
    const staff = await User.findOne({ _id: staffId, role: "staff" });
    if (!staff) return { status: "failed", message: "Staff not found" };
    
    order.assignedStaff = staffId;
    order.staffAssignedAt = new Date();
    
    await order.save();
    return { status: "success", message: "Staff assigned for cleaning", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin assign delivery boy for final delivery
export const AdminAssignDeliveryService = async (req) => {
  try {
    const { id } = req.params;
    const { deliveryBoyId, deliveryCharge } = req.body;
    
    const order = await Order.findById(id);
    if (!order) return { status: "failed", message: "Order not found" };
    if (!["cleaned", "ready"].includes(order.status)) return { status: "failed", message: "Order is not ready for delivery" };
    
    const deliveryBoy = await User.findOne({ _id: deliveryBoyId, role: "delivery" });
    if (!deliveryBoy) return { status: "failed", message: "Delivery boy not found" };
    
    order.deliveryBoy = deliveryBoyId;
    order.deliveryAssignedAt = new Date();
    order.status = "delivery_assigned";
    if (deliveryCharge) order.deliveryCharge = deliveryCharge;
    
    const stepCount = order.trackingSteps.length;
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (i < stepCount - 3) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
      if (i === stepCount - 3) return { ...step.toObject(), status: "current", date: formatDate() };
      return step.toObject();
    });
    
    await order.save();
    return { status: "success", message: "Delivery boy assigned", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin get nearby delivery boys
export const AdminGetNearbyDeliveryBoysService = async (req) => {
  try {
    const { latitude, longitude, maxDistance = 10000 } = req.query;
    
    let filter = { role: "delivery", isAvailable: true, isBlocked: { $ne: true } };
    
    if (latitude && longitude) {
      filter.currentLocation = {
        $near: {
          $geometry: { type: "Point", coordinates: [parseFloat(longitude), parseFloat(latitude)] },
          $maxDistance: parseInt(maxDistance),
        },
      };
    }
    
    const deliveryBoys = await User.find(filter).select("name phone email profileImage currentLocation isAvailable totalEarnings");
    return { status: "success", data: deliveryBoys };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin get all staff
export const AdminGetStaffListService = async (req) => {
  try {
    const staff = await User.find({ role: "staff", isBlocked: { $ne: true } })
      .select("name phone email profileImage");
    return { status: "success", data: staff };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin settle delivery boy earnings
export const AdminSettleEarningsService = async (req) => {
  try {
    const { deliveryBoyId } = req.params;
    const user = await User.findOne({ _id: deliveryBoyId, role: "delivery" });
    if (!user) return { status: "failed", message: "Delivery boy not found" };
    
    const pending = user.pendingEarnings || 0;
    user.totalEarnings = (user.totalEarnings || 0) + pending;
    user.pendingEarnings = 0;
    await user.save();
    
    return { status: "success", message: `Settled ৳${pending} for ${user.name}`, data: user };
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
    const totalDeliveryBoys = await User.countDocuments({ role: "delivery" });
    const totalStaff = await User.countDocuments({ role: "staff" });
    const totalCustomers = await User.countDocuments({ role: "user" });
    const recentOrders = await Order.find().populate("user", "name email").sort({ createdAt: -1 }).limit(5);

    return {
      status: "success",
      data: {
        totalOrders, todaysOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders, completedOrders, cancelledOrders,
        totalDeliveryBoys, totalStaff, totalCustomers,
        recentOrders,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
