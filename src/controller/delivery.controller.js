import {
  DeliveryDashboardStatsService,
  DeliveryPickupOrdersService,
  DeliveryConfirmPickupService,
  DeliveryAtWarehouseService,
  DeliveryOutOrdersService,
  DeliveryStartDeliveryService,
  DeliveryConfirmDeliveryService,
  DeliveryCompletedOrdersService,
  DeliveryUpdateLocationService,
  DeliveryEarningsService,
} from "../service/delivery.service.js";

const handler = (fn) => async (req, res) => {
  const result = await fn(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const DeliveryDashboardStats = handler(DeliveryDashboardStatsService);
export const DeliveryPickupOrders = handler(DeliveryPickupOrdersService);
export const DeliveryConfirmPickup = handler(DeliveryConfirmPickupService);
export const DeliveryAtWarehouse = handler(DeliveryAtWarehouseService);
export const DeliveryOutOrders = handler(DeliveryOutOrdersService);
export const DeliveryStartDelivery = handler(DeliveryStartDeliveryService);
export const DeliveryConfirmDelivery = handler(DeliveryConfirmDeliveryService);
export const DeliveryCompletedOrders = handler(DeliveryCompletedOrdersService);
export const DeliveryUpdateLocation = handler(DeliveryUpdateLocationService);
export const DeliveryEarnings = handler(DeliveryEarningsService);
