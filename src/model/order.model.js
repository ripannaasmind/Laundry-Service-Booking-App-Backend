import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    service: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    serviceName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const trackingStepSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    date: { type: String, default: "Pending" },
    status: { type: String, enum: ["completed", "current", "pending", "cancelled"], default: "pending" },
  },
  { _id: false }
);

const billingInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    email: { type: String, default: "" },
    phone: { type: String, default: "" },
    alternativePhone: { type: String, default: "" },
    address: { type: String, default: "" },
    additionalInstruction: { type: String, default: "" },
  },
  { _id: false }
);

const shippingInfoSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" },
    phone: { type: String, default: "" },
    alternativePhone: { type: String, default: "" },
    address: { type: String, default: "" },
    additionalInstruction: { type: String, default: "" },
  },
  { _id: false }
);

const scheduleSchema = new mongoose.Schema(
  {
    pickupDate: { type: String, default: "" },
    pickupSlot: { type: String, default: "" },
    deliveryDate: { type: String, default: "" },
    deliverySlot: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    itemCount: { type: Number, required: true },
    itemsSummary: { type: String, default: "" },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    status: {
      type: String,
      enum: [
        "pending", "confirmed", "pickup_assigned", "picked_up", 
        "at_warehouse", "in_process", "cleaned", "ready", 
        "delivery_assigned", "out_for_delivery", "delivered", "cancelled"
      ],
      default: "pending",
    },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    totalPayment: { type: Number, required: true },
    couponCode: { type: String, default: null },
    paymentMethod: { type: String, enum: ["card", "cash", "stripe", "paypal", "paystack"], default: "cash" },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded", "failed"], default: "pending" },
    trackingSteps: [trackingStepSchema],
    notes: { type: String, default: "" },
    address: { type: String, default: "" },

    // Billing & Shipping Info
    billingInfo: { type: billingInfoSchema, default: () => ({}) },
    shippingInfo: { type: shippingInfoSchema, default: () => ({}) },

    // Schedule
    schedule: { type: scheduleSchema, default: () => ({}) },

    // Delivery type & speed charge
    deliveryType: { type: String, enum: ["standard", "fast", "premium"], default: "standard" },
    deliverySpeedCharge: { type: Number, default: 0 },

    // Delivery boy assignment - Pickup
    pickupDeliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    pickupAssignedAt: { type: Date, default: null },
    pickedUpAt: { type: Date, default: null },

    // Staff assignment - Cleaning
    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    staffAssignedAt: { type: Date, default: null },
    cleaningStartedAt: { type: Date, default: null },
    cleaningCompletedAt: { type: Date, default: null },
    cleaningNotes: { type: String, default: "" },

    // Delivery boy assignment - Delivery
    deliveryBoy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deliveryAssignedAt: { type: Date, default: null },
    deliveredAt: { type: Date, default: null },

    // Charges
    pickupCharge: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    
    // Store/warehouse
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", default: null },

    // Customer location for pickup/delivery
    customerLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  { timestamps: true, versionKey: false }
);

// Auto-generate orderId
orderSchema.pre("validate", async function () {
  if (!this.orderId) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "#LH";
    for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    this.orderId = result;
  }
});

orderSchema.index({ customerLocation: "2dsphere" });

const Order = mongoose.model("Order", orderSchema);
export default Order;
