import {
  CreateOrderService, GetMyOrdersService, GetOrderByIdService,
  CancelOrderService, GetDashboardStatsService,
  AdminGetAllOrdersService, AdminUpdateOrderStatusService, AdminGetDashboardStatsService,
} from "../service/order.service.js";

// User
export const CreateOrder = async (req, res) => {
  const result = await CreateOrderService(req);
  res.status(result.status === "success" ? 201 : 400).json(result);
};

export const GetMyOrders = async (req, res) => {
  const result = await GetMyOrdersService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const GetOrderById = async (req, res) => {
  const result = await GetOrderByIdService(req);
  res.status(result.status === "success" ? 200 : 404).json(result);
};

export const CancelOrder = async (req, res) => {
  const result = await CancelOrderService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const GetDashboardStats = async (req, res) => {
  const result = await GetDashboardStatsService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// Admin
export const AdminGetAllOrders = async (req, res) => {
  const result = await AdminGetAllOrdersService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const AdminUpdateOrderStatus = async (req, res) => {
  const result = await AdminUpdateOrderStatusService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const AdminGetDashboardStats = async (req, res) => {
  const result = await AdminGetDashboardStatsService();
  res.status(result.status === "success" ? 200 : 400).json(result);
};
