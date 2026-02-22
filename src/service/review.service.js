import Review from "../model/review.model.js";
import Order from "../model/order.model.js";
import Store from "../model/store.model.js";

// Helper: Recalculate store rating from its reviews
const updateStoreRating = async (storeId) => {
  if (!storeId) return;
  const result = await Review.aggregate([
    { $match: { store: storeId, status: "approved" } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  const avg = result[0]?.avg || 0;
  const count = result[0]?.count || 0;
  await Store.findByIdAndUpdate(storeId, { rating: Math.round(avg * 10) / 10, totalReviews: count });
};

// User: Create a review (only for delivered orders)
export const CreateReviewService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { orderId, service, rating, comment } = req.body;
    if (!orderId || !rating) return { status: "failed", message: "Order ID and rating are required" };

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) return { status: "failed", message: "Order not found" };
    if (order.status !== "delivered") return { status: "failed", message: "Can only review delivered orders" };

    const existing = await Review.findOne({ user: userId, order: orderId });
    if (existing) return { status: "failed", message: "You have already reviewed this order" };

    // Find the nearest store to auto-link
    let storeId = order.store || null;
    if (!storeId && order.customerLocation?.coordinates?.[0]) {
      const nearbyStore = await Store.findOne({
        isActive: true,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: order.customerLocation.coordinates },
            $maxDistance: 15000,
          },
        },
      });
      if (nearbyStore) storeId = nearbyStore._id;
    }

    const review = await Review.create({
      user: userId, order: orderId, orderId: order.orderId,
      service: service || order.itemsSummary,
      rating, comment: comment || "",
      store: storeId,
    });

    // Auto-approve and update store rating
    review.status = "approved";
    await review.save();
    await updateStoreRating(storeId);

    return { status: "success", message: "Review submitted successfully", data: review };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Get my reviews
export const GetMyReviewsService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const reviews = await Review.find({ user: userId })
      .populate("order", "orderId itemsSummary totalPayment")
      .populate("store", "name slug area")
      .sort({ createdAt: -1 });
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
    await review.save();
    await updateStoreRating(review.store);
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
    await updateStoreRating(review.store);
    return { status: "success", message: "Review deleted" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Public: Get approved reviews (homepage / service pages)
export const GetApprovedReviewsService = async (req) => {
  try {
    const { limit = 10, storeId } = req.query;
    const filter = { status: "approved" };
    if (storeId) filter.store = storeId;

    const reviews = await Review.find(filter)
      .populate("user", "name profileImage")
      .populate("store", "name slug area")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));
    return { status: "success", data: reviews };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Public: Get reviews by store
export const GetStoreReviewsService = async (req) => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const filter = { store: storeId, status: "approved" };
    const reviews = await Review.find(filter)
      .populate("user", "name profileImage")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));
    const total = await Review.countDocuments(filter);
    return { status: "success", data: { reviews, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) } };
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
      .populate("store", "name slug area")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit, 10));
    const total = await Review.countDocuments(filter);
    const avgRating = await Review.aggregate([{ $match: { status: "approved" } }, { $group: { _id: null, avg: { $avg: "$rating" } } }]);

    return {
      status: "success",
      data: {
        reviews, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit),
        avgRating: avgRating[0]?.avg?.toFixed(1) || "0.0",
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Update review status and reply
export const AdminUpdateReviewService = async (req) => {
  try {
    const { id } = req.params;
    const { status: newStatus, adminReply } = req.body;
    const review = await Review.findById(id);
    if (!review) return { status: "failed", message: "Review not found" };

    if (newStatus) review.status = newStatus;
    if (adminReply !== undefined) review.adminReply = adminReply;
    await review.save();
    await updateStoreRating(review.store);
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
    await updateStoreRating(review.store);
    return { status: "success", message: "Review deleted" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
