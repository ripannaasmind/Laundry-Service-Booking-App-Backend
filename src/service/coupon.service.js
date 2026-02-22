import Coupon from "../model/coupon.model.js";

// User: Get active coupons
export const GetActiveCouponsService = async () => {
  try {
    const coupons = await Coupon.find({
      isActive: true,
      expiryDate: { $gt: new Date() },
      $expr: { $lt: ["$usedCount", "$usageLimit"] },
    }).sort({ createdAt: -1 });
    return { status: "success", data: coupons };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// User: Validate a coupon code
export const ValidateCouponService = async (req) => {
  try {
    const { code, orderTotal } = req.body;
    const userId = req.headers.user_id;
    if (!code) return { status: "failed", message: "Coupon code is required" };

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return { status: "failed", message: "Invalid coupon code" };
    if (coupon.expiryDate < new Date()) return { status: "failed", message: "Coupon has expired" };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { status: "failed", message: "Coupon usage limit reached" };
    if (orderTotal && orderTotal < coupon.minOrderValue) return { status: "failed", message: `Minimum order value is $${coupon.minOrderValue}` };

    // Check per-user limit
    if (coupon.perUserLimit && userId) {
      const userUsage = coupon.usedBy?.find(u => u.userId?.toString() === userId);
      if (userUsage && userUsage.count >= coupon.perUserLimit) {
        return { status: "failed", message: "You have already used this coupon the maximum number of times" };
      }
    }

    const discount = coupon.discountType === "percentage"
      ? Math.min((orderTotal || 0) * coupon.discountValue / 100, coupon.maxDiscount || Infinity)
      : coupon.discountValue;

    return {
      status: "success",
      data: {
        code: coupon.code, title: coupon.title, discountType: coupon.discountType,
        discountValue: coupon.discountValue, discount, maxDiscount: coupon.maxDiscount,
        minOrderValue: coupon.minOrderValue,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Get all coupons
export const AdminGetAllCouponsService = async (req) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status === "active") { filter.isActive = true; filter.expiryDate = { $gt: new Date() }; }
    else if (status === "expired") { filter.$or = [{ isActive: false }, { expiryDate: { $lte: new Date() } }]; }

    const coupons = await Coupon.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit, 10));
    const total = await Coupon.countDocuments(filter);
    return { status: "success", data: { coupons, total, page: parseInt(page, 10), totalPages: Math.ceil(total / limit) } };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Create coupon
export const AdminCreateCouponService = async (req) => {
  try {
    const coupon = await Coupon.create(req.body);
    return { status: "success", message: "Coupon created", data: coupon };
  } catch (e) {
    if (e.code === 11000) return { status: "failed", message: "Coupon code already exists" };
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Update coupon
export const AdminUpdateCouponService = async (req) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!coupon) return { status: "failed", message: "Coupon not found" };
    return { status: "success", message: "Coupon updated", data: coupon };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin: Delete coupon
export const AdminDeleteCouponService = async (req) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByIdAndDelete(id);
    if (!coupon) return { status: "failed", message: "Coupon not found" };
    return { status: "success", message: "Coupon deleted" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
