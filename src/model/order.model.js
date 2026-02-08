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
      enum: ["pending", "confirmed", "picked_up", "in_process", "ready", "out_for_delivery", "delivered", "cancelled"],
      default: "pending",
    },
    discount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    totalPayment: { type: Number, required: true },
    couponCode: { type: String, default: null },
    paymentMethod: { type: String, enum: ["card", "cash", "wallet"], default: "card" },
    paymentStatus: { type: String, enum: ["pending", "paid", "refunded", "failed"], default: "pending" },
    trackingSteps: [trackingStepSchema],
    notes: { type: String, default: "" },
    address: { type: String, default: "" },
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

const Order = mongoose.model("Order", orderSchema);
export default Order;
