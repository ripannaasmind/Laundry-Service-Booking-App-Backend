import {
  GetAllStoresService,
  GetNearbyStoresService,
  GetStoreBySlugService,
  AdminGetAllStoresService,
  CreateStoreService,
  UpdateStoreService,
  DeleteStoreService,
} from "../service/store.service.js";

// ========== PUBLIC ==========

// GET /stores - Get all active stores
export const GetAllStores = async (req, res) => {
  const result = await GetAllStoresService(req.query);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// GET /stores/nearby?lat=23.7945&lng=90.4043&radius=10 - Get nearby stores
export const GetNearbyStores = async (req, res) => {
  const result = await GetNearbyStoresService(req.query);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// GET /stores/:slug - Get single store by slug or ID
export const GetStoreBySlug = async (req, res) => {
  const result = await GetStoreBySlugService(req.params.slug);
  res.status(result.status === "success" ? 200 : 404).json(result);
};

// ========== ADMIN ==========

// GET /admin/stores - Get all stores (admin)
export const AdminGetAllStores = async (req, res) => {
  const result = await AdminGetAllStoresService(req.query);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// POST /admin/stores - Create store
export const AdminCreateStore = async (req, res) => {
  const result = await CreateStoreService(req.body);
  res.status(result.status === "success" ? 201 : 400).json(result);
};

// PUT /admin/stores/:id - Update store
export const AdminUpdateStore = async (req, res) => {
  const result = await UpdateStoreService(req.params.id, req.body);
  res.status(result.status === "success" ? 200 : 400).json(result);
};

// DELETE /admin/stores/:id - Delete store
export const AdminDeleteStore = async (req, res) => {
  const result = await DeleteStoreService(req.params.id);
  res.status(result.status === "success" ? 200 : 400).json(result);
};
