import Service from "../model/service.model.js";

export const GetAllServicesService = async () => {
  try {
    const services = await Service.find({ isActive: true }).sort({ sortOrder: 1 });
    return { status: "success", data: services };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const GetServiceBySlugService = async (slug) => {
  try {
    const service = await Service.findOne({ slug });
    if (!service) return { status: "failed", message: "Service not found" };
    return { status: "success", data: service };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

// Admin
export const AdminGetAllServicesService = async () => {
  try {
    const services = await Service.find().sort({ sortOrder: 1 });
    return { status: "success", data: services };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const CreateServiceService = async (req) => {
  try {
    const { name, description, shortDescription, pricingType, pricePerKg, pricePerItem, estimatedDays, category, features, sortOrder } = req.body;
    if (!name || !description) return { status: "failed", message: "Name and description are required" };
    
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await Service.findOne({ slug });
    if (existing) return { status: "failed", message: "Service with this name already exists" };

    const service = await Service.create({
      name, slug, description, shortDescription, 
      pricingType: pricingType || "per_kg",
      pricePerKg: pricePerKg || 0, pricePerItem: pricePerItem || 0,
      estimatedDays: estimatedDays || 3, category: category || "general",
      features: features || [], sortOrder: sortOrder || 0,
    });
    return { status: "success", message: "Service created", data: service };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const UpdateServiceService = async (req) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndUpdate(id, req.body, { new: true });
    if (!service) return { status: "failed", message: "Service not found" };
    return { status: "success", message: "Service updated", data: service };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

export const DeleteServiceService = async (req) => {
  try {
    const { id } = req.params;
    const service = await Service.findByIdAndDelete(id);
    if (!service) return { status: "failed", message: "Service not found" };
    return { status: "success", message: "Service deleted" };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
