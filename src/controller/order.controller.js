import {
  CreateOrderService, GetMyOrdersService, GetOrderByIdService,
  CancelOrderService, GetDashboardStatsService,
  AdminGetAllOrdersService, AdminUpdateOrderStatusService, AdminGetDashboardStatsService,
  AdminAssignPickupService, AdminAssignStaffService, AdminAssignDeliveryService,
  AdminGetNearbyDeliveryBoysService, AdminGetStaffListService, AdminSettleEarningsService,
} from "../service/order.service.js";

const handler = (fn, successCode = 200) => async (req, res) => {
  const result = await fn(req);
  res.status(result.status === "success" ? successCode : 400).json(result);
};

// User
export const CreateOrder = handler(CreateOrderService, 201);
export const GetMyOrders = handler(GetMyOrdersService);
export const GetOrderById = handler(GetOrderByIdService);
export const CancelOrder = handler(CancelOrderService);
export const GetDashboardStats = handler(GetDashboardStatsService);

// Admin
export const AdminGetAllOrders = handler(AdminGetAllOrdersService);
export const AdminUpdateOrderStatus = handler(AdminUpdateOrderStatusService);
export const AdminGetDashboardStats = async (req, res) => {
  const result = await AdminGetDashboardStatsService();
  res.status(result.status === "success" ? 200 : 400).json(result);
};
export const AdminAssignPickup = handler(AdminAssignPickupService);
export const AdminAssignStaff = handler(AdminAssignStaffService);
export const AdminAssignDelivery = handler(AdminAssignDeliveryService);
export const AdminGetNearbyDeliveryBoys = handler(AdminGetNearbyDeliveryBoysService);
export const AdminGetStaffList = handler(AdminGetStaffListService);
export const AdminSettleEarnings = handler(AdminSettleEarningsService);
