import Order from "../model/order.model.js";

const formatDate = () => new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

// Get staff dashboard stats
export const StaffDashboardStatsService = async (req) => {
  try {
    const staffId = req.headers.user_id;
    
    const assignedOrders = await Order.countDocuments({ assignedStaff: staffId, status: { $in: ["at_warehouse", "in_process"] } });
    const cleaningInProgress = await Order.countDocuments({ assignedStaff: staffId, status: "in_process" });
    const completedToday = await Order.countDocuments({
      assignedStaff: staffId,
      status: "cleaned",
      cleaningCompletedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });
    const totalCompleted = await Order.countDocuments({ assignedStaff: staffId, status: { $in: ["cleaned", "ready", "delivery_assigned", "out_for_delivery", "delivered"] } });
    
    const recentOrders = await Order.find({ assignedStaff: staffId })
      .populate("user", "name phone")
      .sort({ staffAssignedAt: -1 })
      .limit(10);

    return {
      status: "success",
      data: {
        assignedOrders,
        cleaningInProgress,
        completedToday,
        totalCompleted,
        recentOrders,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Get staff assigned orders
export const StaffGetOrdersService = async (req) => {
  try {
    const staffId = req.headers.user_id;
    const { status } = req.query;
    
    const filter = { assignedStaff: staffId };
    if (status && status !== "all") {
      if (status === "pending") filter.status = { $in: ["at_warehouse"] };
      else if (status === "in_progress") filter.status = "in_process";
      else if (status === "completed") filter.status = { $in: ["cleaned", "ready", "delivery_assigned", "out_for_delivery", "delivered"] };
      else filter.status = status;
    }
    
    const orders = await Order.find(filter)
      .populate("user", "name phone email")
      .sort({ staffAssignedAt: -1 });
    
    return { status: "success", data: orders };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Start cleaning an order
export const StaffStartCleaningService = async (req) => {
  try {
    const staffId = req.headers.user_id;
    const { id } = req.params;
    
    const order = await Order.findOne({ _id: id, assignedStaff: staffId, status: "at_warehouse" });
    if (!order) return { status: "failed", message: "Order not found or not assigned to you" };
    
    order.status = "in_process";
    order.cleaningStartedAt = new Date();
    
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (i <= 3) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
      if (i === 4) return { ...step.toObject(), status: "current", date: formatDate() };
      return step.toObject();
    });
    
    await order.save();
    return { status: "success", message: "Cleaning started", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Complete cleaning
export const StaffCompleteCleaningService = async (req) => {
  try {
    const staffId = req.headers.user_id;
    const { id } = req.params;
    const { cleaningNotes } = req.body;
    
    const order = await Order.findOne({ _id: id, assignedStaff: staffId, status: "in_process" });
    if (!order) return { status: "failed", message: "Order not found or not in process" };
    
    order.status = "cleaned";
    order.cleaningCompletedAt = new Date();
    if (cleaningNotes) order.cleaningNotes = cleaningNotes;
    
    order.trackingSteps = order.trackingSteps.map((step, i) => {
      if (i <= 4) return { ...step.toObject(), status: "completed", date: step.date === "Pending" ? formatDate() : step.date };
      if (i === 5) return { ...step.toObject(), status: "current", date: formatDate() };
      return step.toObject();
    });
    
    await order.save();
    return { status: "success", message: "Cleaning completed", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Get order details for staff
export const StaffGetOrderDetailService = async (req) => {
  try {
    const staffId = req.headers.user_id;
    const { id } = req.params;
    
    const order = await Order.findOne({ _id: id, assignedStaff: staffId })
      .populate("user", "name phone email address")
      .populate("pickupDeliveryBoy", "name phone")
      .populate("deliveryBoy", "name phone");
    
    if (!order) return { status: "failed", message: "Order not found" };
    return { status: "success", data: order };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
