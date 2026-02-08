import {
  GetAllServicesService,
  GetServiceBySlugService,
  AdminGetAllServicesService,
  CreateServiceService,
  UpdateServiceService,
  DeleteServiceService,
} from "../service/service.service.js";

// Public
export const GetAllServices = async (req, res) => {
  const result = await GetAllServicesService();
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const GetServiceBySlug = async (req, res) => {
  const result = await GetServiceBySlugService(req.params.slug);
  res.status(result.status === "success" ? 200 : 404).json(result);
};

// Admin
export const AdminGetAllServices = async (req, res) => {
  const result = await AdminGetAllServicesService();
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const CreateService = async (req, res) => {
  const result = await CreateServiceService(req);
  res.status(result.status === "success" ? 201 : 400).json(result);
};

export const UpdateService = async (req, res) => {
  const result = await UpdateServiceService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

export const DeleteService = async (req, res) => {
  const result = await DeleteServiceService(req);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
