import {
  CreateReviewService, GetMyReviewsService, UpdateMyReviewService,
  DeleteMyReviewService, GetApprovedReviewsService,
  AdminGetAllReviewsService, AdminUpdateReviewService, AdminDeleteReviewService,
} from "../service/review.service.js";

// User
export const CreateReview = async (req, res) => {
  const result = await CreateReviewService(req);
  res.status(result.status === "success" ? 201 : 400).json(result);
};

export const GetMyReviews = async (req, res) => {
  const result = await GetMyReviewsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const UpdateMyReview = async (req, res) => {
  const result = await UpdateMyReviewService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const DeleteMyReview = async (req, res) => {
  const result = await DeleteMyReviewService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// Public
export const GetApprovedReviews = async (req, res) => {
  const result = await GetApprovedReviewsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// Admin
export const AdminGetAllReviews = async (req, res) => {
  const result = await AdminGetAllReviewsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const AdminUpdateReview = async (req, res) => {
  const result = await AdminUpdateReviewService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const AdminDeleteReview = async (req, res) => {
  const result = await AdminDeleteReviewService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
