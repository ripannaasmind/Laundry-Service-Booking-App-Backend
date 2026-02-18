import mongoose from "mongoose";

const ticketNoteSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    byRole: { type: String, enum: ["user", "staff", "admin"], required: true },
    message: { type: String, required: true },
  },
  { timestamps: true, _id: true }
);

const ticketSchema = new mongoose.Schema(
  {
    tokenNumber: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["order_issue", "payment_issue", "delivery_issue", "service_quality", "account_issue", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "assigned", "in_progress", "resolved", "closed"],
      default: "open",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    relatedOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    notes: [ticketNoteSchema],
    staffReview: {
      calledUser: { type: Boolean, default: false },
      callNotes: { type: String, default: "" },
      resolvedByCall: { type: Boolean, default: false },
    },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

// Auto-generate token number: TKT-YYYYMMDD-XXXX
ticketSchema.pre("validate", async function () {
  if (this.isNew && !this.tokenNumber) {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await mongoose.model("Ticket").countDocuments({
      createdAt: { $gte: new Date(today.setHours(0, 0, 0, 0)) },
    });
    this.tokenNumber = `TKT-${dateStr}-${String(count + 1).padStart(4, "0")}`;
  }
});

ticketSchema.index({ user: 1, status: 1 });
ticketSchema.index({ assignedTo: 1, status: 1 });
ticketSchema.index({ status: 1, priority: 1 });

const Ticket = mongoose.model("Ticket", ticketSchema);
export default Ticket;
