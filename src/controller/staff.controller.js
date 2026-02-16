import {
  StaffDashboardStatsService,
  StaffGetOrdersService,
  StaffStartCleaningService,
  StaffCompleteCleaningService,
  StaffGetOrderDetailService,
} from "../service/staff.service.js";

const handler = (fn) => async (req, res) => {
  const result = await fn(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const StaffDashboardStats = handler(StaffDashboardStatsService);
export const StaffGetOrders = handler(StaffGetOrdersService);
export const StaffStartCleaning = handler(StaffStartCleaningService);
export const StaffCompleteCleaning = handler(StaffCompleteCleaningService);
export const StaffGetOrderDetail = handler(StaffGetOrderDetailService);
