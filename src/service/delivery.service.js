import Order from "../model/order.model.js";
import User from "../model/user.model.js";

const formatDate = () => new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

// Get delivery boy's dashboard stats
export const DeliveryDashboardStatsService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    
    const assigned = await Order.countDocuments({
      $or: [
        { pickupDeliveryBoy: deliveryBoyId, status: "pickup_assigned" },
        { deliveryBoy: deliveryBoyId, status: "delivery_assigned" },
      ],
    });
    
    const pickedUp = await Order.countDocuments({ pickupDeliveryBoy: deliveryBoyId, status: "picked_up" });
    const inTransit = await Order.countDocuments({ deliveryBoy: deliveryBoyId, status: "out_for_delivery" });
    const completed = await Order.countDocuments({ deliveryBoy: deliveryBoyId, status: "delivered" });
    
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayOrders = await Order.find({
      $or: [
        { pickupDeliveryBoy: deliveryBoyId },
        { deliveryBoy: deliveryBoyId },
      ],
      updatedAt: { $gte: todayStart },
    }).populate("user", "name phone address").sort({ updatedAt: -1 }).limit(10);

    const user = await User.findById(deliveryBoyId);

    return {
      status: "success",
      data: {
        assigned, pickedUp, inTransit, completed,
        todayOrders,
        totalEarnings: user?.totalEarnings || 0,
        pendingEarnings: user?.pendingEarnings || 0,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Get orders assigned for pickup
export const DeliveryPickupOrdersService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const orders = await Order.find({
      pickupDeliveryBoy: deliveryBoyId,
      status: { $in: ["pickup_assigned", "picked_up"] },
    }).populate("user", "name phone email address").sort({ pickupAssignedAt: -1 });
    
    return { status: "success", data: orders };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Confirm pickup - delivery boy picked up from customer
export const DeliveryConfirmPickupService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const { id } = req.params;
    
    const order = await Order.findOne({ _id: id, pickupDeliveryBoy: deliveryBoyId, status: "pickup_assigned" });
    if (!order) return { status: "failed", message: "Order not found or not assigned to you" };
    
    order.status = "picked_up";
    order.pickedUpAt = new Date();
    
    // Update tracking
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (i <= 1) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
      if (i === 2) return { ...step.toObject(), status: "current", date: formatDate() };
      return step.toObject();
    });
    
    await order.save();
    return { status: "success", message: "Pickup confirmed", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Confirm delivered to warehouse
export const DeliveryAtWarehouseService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const { id } = req.params;
    
    const order = await Order.findOne({ _id: id, pickupDeliveryBoy: deliveryBoyId, status: "picked_up" });
    if (!order) return { status: "failed", message: "Order not found or not in picked_up state" };
    
    order.status = "at_warehouse";
    
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (i <= 2) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
      if (i === 3) return { ...step.toObject(), status: "current", date: formatDate() };
      return step.toObject();
    });
    
    await order.save();
    
    // Add pickup charge to delivery boy earnings
    if (order.pickupCharge > 0) {
      await User.findByIdAndUpdate(deliveryBoyId, {
        $inc: { pendingEarnings: order.pickupCharge },
      });
    }
    
    return { status: "success", message: "Order delivered to warehouse", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Get orders assigned for final delivery
export const DeliveryOutOrdersService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const orders = await Order.find({
      deliveryBoy: deliveryBoyId,
      status: { $in: ["delivery_assigned", "out_for_delivery"] },
    }).populate("user", "name phone email address").sort({ deliveryAssignedAt: -1 });
    
    return { status: "success", data: orders };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Start delivery - out for delivery
export const DeliveryStartDeliveryService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const { id } = req.params;
    
    const order = await Order.findOne({ _id: id, deliveryBoy: deliveryBoyId, status: "delivery_assigned" });
    if (!order) return { status: "failed", message: "Order not found or not assigned to you" };
    
    order.status = "out_for_delivery";
    
    const stepCount = order.trackingSteps.length;
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (i < stepCount - 2) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
      if (i === stepCount - 2) return { ...step.toObject(), status: "current", date: formatDate() };
      return step.toObject();
    });
    
    await order.save();
    return { status: "success", message: "Out for delivery", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Confirm final delivery to customer
export const DeliveryConfirmDeliveryService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const { id } = req.params;
    
    const order = await Order.findOne({ _id: id, deliveryBoy: deliveryBoyId, status: "out_for_delivery" });
    if (!order) return { status: "failed", message: "Order not found or not out for delivery" };
    
    order.status = "delivered";
    order.deliveredAt = new Date();
    
    // Mark all tracking steps as completed
    order.trackingSteps = order.trackingSteps.map(step => ({
      ...step.toObject(),
      status: "completed",
      date: step.date === "Pending" ? formatDate() : step.date,
    }));
    
    await order.save();
    
    // Add delivery charge to delivery boy earnings
    if (order.deliveryCharge > 0) {
      await User.findByIdAndUpdate(deliveryBoyId, {
        $inc: { pendingEarnings: order.deliveryCharge },
      });
    }
    
    return { status: "success", message: "Delivery completed", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Get completed deliveries
export const DeliveryCompletedOrdersService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const { page = 1, limit = 20 } = req.query;
    
    const filter = {
      $or: [
        { pickupDeliveryBoy: deliveryBoyId },
        { deliveryBoy: deliveryBoyId },
      ],
      status: "delivered",
    };
    
    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate("user", "name phone email")
      .sort({ deliveredAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));
    
    return { status: "success", data: { orders, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) } };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Update delivery boy location
export const DeliveryUpdateLocationService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) return { status: "failed", message: "Latitude and longitude required" };
    
    await User.findByIdAndUpdate(deliveryBoyId, {
      currentLocation: { type: "Point", coordinates: [longitude, latitude] },
    });
    
    return { status: "success", message: "Location updated" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Get delivery boy earnings
export const DeliveryEarningsService = async (req) => {
  try {
    const deliveryBoyId = req.headers.user_id;
    const user = await User.findById(deliveryBoyId);
    
    // Get recent order earnings
    const recentOrders = await Order.find({
      $or: [
        { pickupDeliveryBoy: deliveryBoyId, pickedUpAt: { $ne: null } },
        { deliveryBoy: deliveryBoyId, deliveredAt: { $ne: null } },
      ],
    }).sort({ updatedAt: -1 }).limit(20).populate("user", "name");
    
    const earnings = recentOrders.map(o => ({
      orderId: o.orderId,
      customerName: o.user?.name || "Customer",
      type: o.deliveryBoy?.toString() === deliveryBoyId && o.deliveredAt ? "delivery" : "pickup",
      amount: o.deliveryBoy?.toString() === deliveryBoyId && o.deliveredAt ? o.deliveryCharge : o.pickupCharge,
      date: o.updatedAt,
    }));
    
    return {
      status: "success",
      data: {
        totalEarnings: user?.totalEarnings || 0,
        pendingEarnings: user?.pendingEarnings || 0,
        earnings,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
