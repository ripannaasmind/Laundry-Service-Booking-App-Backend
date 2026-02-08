import {
  GetActiveCouponsService, ValidateCouponService,
  AdminGetAllCouponsService, AdminCreateCouponService,
  AdminUpdateCouponService, AdminDeleteCouponService,
} from "../service/coupon.service.js";

// User
export const GetActiveCoupons = async (req, res) => {
  const result = await GetActiveCouponsService();
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const ValidateCoupon = async (req, res) => {
  const result = await ValidateCouponService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// Admin
export const AdminGetAllCoupons = async (req, res) => {
  const result = await AdminGetAllCouponsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const AdminCreateCoupon = async (req, res) => {
  const result = await AdminCreateCouponService(req);
  res.status(result.status === "success" ? 201 : 400).json(result);
};

export const AdminUpdateCoupon = async (req, res) => {
  const result = await AdminUpdateCouponService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const AdminDeleteCoupon = async (req, res) => {
  const result = await AdminDeleteCouponService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
