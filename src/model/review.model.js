import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", default: null },
    orderId: { type: String, required: true },
    service: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    adminReply: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

reviewSchema.index({ user: 1, order: 1 }, { unique: true });
reviewSchema.index({ store: 1, status: 1 });

const Review = mongoose.model("Review", reviewSchema);
export default Review;
