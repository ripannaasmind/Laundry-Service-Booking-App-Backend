import Review from "../model/review.model.js";
import Order from "../model/order.model.js";

// User: Create a review
export const CreateReviewService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { orderId, service, rating, comment } = req.body;
    if (!orderId || !rating) return { status: "failed", message: "Order ID and rating are required" };

    // Verify the order belongs to user and is delivered
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return { status: "failed", message: "Order not found" };
    if (order.status !== "delivered") return { status: "failed", message: "Can only review delivered orders" };

    // Check if already reviewed
    const existing = await Review.findOne({ user: userId, order: orderId });
    if (existing) return { status: "failed", message: "You have already reviewed this order" };

    const review = await Review.create({
      user: userId, order: orderId, orderId: order.orderId,
      service: service || order.itemsSummary, rating, comment: comment || "",
    });

    return { status: "success", message: "Review submitted", data: review };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Get my reviews
export const GetMyReviewsService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const reviews = await Review.find({ user: userId }).populate("order", "orderId itemsSummary totalPayment").sort({ createdAt: -1 });
    return { status: "success", data: reviews };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Update own review
export const UpdateMyReviewService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    const { rating, comment } = req.body;
    const review = await Review.findOne({ _id: id, user: userId });
    if (!review) return { status: "failed", message: "Review not found" };

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    review.status = "pending"; // Re-submit for moderation
    await review.save();
    return { status: "success", message: "Review updated", data: review };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Delete own review
export const DeleteMyReviewService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { id } = req.params;
    const review = await Review.findOneAndDelete({ _id: id, user: userId });
    if (!review) return { status: "failed", message: "Review not found" };
    return { status: "success", message: "Review deleted" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Public: Get approved reviews (for homepage / service pages)
export const GetApprovedReviewsService = async (req) => {
  try {
    const { limit = 10 } = req.query;
    const reviews = await Review.find({ status: "approved" })
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    return { status: "success", data: reviews };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Get all reviews
export const AdminGetAllReviewsService = async (req) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const reviews = await Review.find(filter)
      .populate("user", "name email profileImage")
      .populate("order", "orderId totalPayment")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Review.countDocuments(filter);

    const avgRating = await Review.aggregate([{ $match: { status: "approved" } }, { $group: { _id: null, avg: { $avg: "$rating" } } }]);

    return {
      status: "success",
      data: {
        reviews, total, page: parseInt(page), totalPages: Math.ceil(total / limit),
        avgRating: avgRating[0]?.avg?.toFixed(1) || "0.0",
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Update review status (approve/reject) and admin reply
export const AdminUpdateReviewService = async (req) => {
  try {
    const { id } = req.params;
    const { status: newStatus, adminReply } = req.body;
    const review = await Review.findById(id);
    if (!review) return { status: "failed", message: "Review not found" };

    if (newStatus) review.status = newStatus;
    if (adminReply !== undefined) review.adminReply = adminReply;
    await review.save();
    return { status: "success", message: "Review updated", data: review };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Delete review
export const AdminDeleteReviewService = async (req) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndDelete(id);
    if (!review) return { status: "failed", message: "Review not found" };
    return { status: "success", message: "Review deleted" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
