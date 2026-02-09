import Store from "../model/store.model.js";

/**
 * Get all stores (Public) - with search, filter, pagination
 */
export const GetAllStoresService = async (query) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      city,
      area,
      isActive = "true",
      sortBy = "sortOrder",
      sortOrder = "asc",
      featured,
    } = query;

    const filter = {};

    // Active filter
    if (isActive === "true") filter.isActive = true;
    else if (isActive === "false") filter.isActive = false;

    // City filter
    if (city) filter.city = { $regex: city, $options: "i" };

    // Area filter
    if (area) filter.area = { $regex: area, $options: "i" };

    // Featured filter
    if (featured === "true") filter.isFeatured = true;

    // Search by name, address, area
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    // Sort
    const sortObj = {};
    sortObj[sortBy] = sortOrder === "desc" ? -1 : 1;

    const total = await Store.countDocuments(filter);
    const stores = await Store.find(filter)
      .populate("services", "name slug image pricePerKg pricePerItem")
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      status: "success",
      data: stores,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return { status: "fail", message: error.toString() };
  }
};

/**
 * Get nearby stores by lat/lng (Public)
 * Uses MongoDB $geoNear for geospatial query
 */
export const GetNearbyStoresService = async (query) => {
  try {
    const { lat, lng, radius = 10, limit = 20, page = 1 } = query;

    if (!lat || !lng) {
      return { status: "fail", message: "Latitude (lat) and Longitude (lng) are required" };
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const maxDistance = parseFloat(radius) * 1000; // Convert km to meters

    const stores = await Store.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distance",     // Distance in meters
          maxDistance: maxDistance,
          spherical: true,
          query: { isActive: true },
        },
      },
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ["$distance", 1000] }, 2] },
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "services",
          foreignField: "_id",
          as: "services",
          pipeline: [
            { $project: { name: 1, slug: 1, image: 1, pricePerKg: 1, pricePerItem: 1 } },
          ],
        },
      },
    ]);

    // Get total count for pagination
    const totalResult = await Store.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [longitude, latitude] },
          distanceField: "distance",
          maxDistance: maxDistance,
          spherical: true,
          query: { isActive: true },
        },
      },
      { $count: "total" },
    ]);
    const total = totalResult[0]?.total || 0;

    return {
      status: "success",
      data: stores,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
      query: {
        lat: latitude,
        lng: longitude,
        radiusKm: parseFloat(radius),
      },
    };
  } catch (error) {
    return { status: "fail", message: error.toString() };
  }
};

/**
 * Get single store by slug or ID (Public)
 */
export const GetStoreBySlugService = async (slugOrId) => {
  try {
    let store;

    // Try finding by slug first, then by ID
    store = await Store.findOne({ slug: slugOrId, isActive: true })
      .populate("services", "name slug description image pricePerKg pricePerItem pricingType estimatedDays category features")
      .populate("manager", "name email phone");

    if (!store) {
      // Try by ID
      if (slugOrId.match(/^[0-9a-fA-F]{24}$/)) {
        store = await Store.findOne({ _id: slugOrId, isActive: true })
          .populate("services", "name slug description image pricePerKg pricePerItem pricingType estimatedDays category features")
          .populate("manager", "name email phone");
      }
    }

    if (!store) {
      return { status: "fail", message: "Store not found" };
    }

    return { status: "success", data: store };
  } catch (error) {
    return { status: "fail", message: error.toString() };
  }
};

// ========== ADMIN SERVICES ==========

/**
 * Admin: Get all stores (includes inactive)
 */
export const AdminGetAllStoresService = async (query) => {
  try {
    const { page = 1, limit = 20, search, isActive } = query;
    const filter = {};

    if (isActive === "true") filter.isActive = true;
    else if (isActive === "false") filter.isActive = false;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { address: { $regex: search, $options: "i" } },
        { area: { $regex: search, $options: "i" } },
        { city: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Store.countDocuments(filter);
    const stores = await Store.find(filter)
      .populate("services", "name slug")
      .populate("manager", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return {
      status: "success",
      data: stores,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    return { status: "fail", message: error.toString() };
  }
};

/**
 * Admin: Create a new store
 */
export const CreateStoreService = async (body) => {
  try {
    const {
      name, description, address, area, city, state, zipCode, country,
      latitude, longitude, phone, email, image, images,
      operatingHours, services, features, isActive, isFeatured, sortOrder, manager,
    } = body;

    if (!name || !address || latitude === undefined || longitude === undefined) {
      return { status: "fail", message: "Name, address, latitude, and longitude are required" };
    }

    // Create slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now().toString(36);

    const store = await Store.create({
      name,
      slug,
      description: description || "",
      address,
      area: area || "",
      city: city || "Dhaka",
      state: state || "",
      zipCode: zipCode || "",
      country: country || "Bangladesh",
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      phone: phone || "",
      email: email || "",
      image: image || "",
      images: images || [],
      operatingHours: operatingHours || undefined,
      services: services || [],
      features: features || [],
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured || false,
      sortOrder: sortOrder || 0,
      manager: manager || null,
    });

    return { status: "success", message: "Store created successfully", data: store };
  } catch (error) {
    if (error.code === 11000) {
      return { status: "fail", message: "Store with this name already exists" };
    }
    return { status: "fail", message: error.toString() };
  }
};

/**
 * Admin: Update a store
 */
export const UpdateStoreService = async (id, body) => {
  try {
    const store = await Store.findById(id);
    if (!store) return { status: "fail", message: "Store not found" };

    const {
      name, description, address, area, city, state, zipCode, country,
      latitude, longitude, phone, email, image, images,
      operatingHours, services, features, isActive, isFeatured, sortOrder, manager,
      rating, totalReviews,
    } = body;

    if (name !== undefined) store.name = name;
    if (description !== undefined) store.description = description;
    if (address !== undefined) store.address = address;
    if (area !== undefined) store.area = area;
    if (city !== undefined) store.city = city;
    if (state !== undefined) store.state = state;
    if (zipCode !== undefined) store.zipCode = zipCode;
    if (country !== undefined) store.country = country;
    if (phone !== undefined) store.phone = phone;
    if (email !== undefined) store.email = email;
    if (image !== undefined) store.image = image;
    if (images !== undefined) store.images = images;
    if (operatingHours !== undefined) store.operatingHours = operatingHours;
    if (services !== undefined) store.services = services;
    if (features !== undefined) store.features = features;
    if (isActive !== undefined) store.isActive = isActive;
    if (isFeatured !== undefined) store.isFeatured = isFeatured;
    if (sortOrder !== undefined) store.sortOrder = sortOrder;
    if (manager !== undefined) store.manager = manager;
    if (rating !== undefined) store.rating = rating;
    if (totalReviews !== undefined) store.totalReviews = totalReviews;

    // Update location if lat/lng provided
    if (latitude !== undefined && longitude !== undefined) {
      store.location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    await store.save();
    return { status: "success", message: "Store updated successfully", data: store };
  } catch (error) {
    return { status: "fail", message: error.toString() };
  }
};

/**
 * Admin: Delete a store
 */
export const DeleteStoreService = async (id) => {
  try {
    const store = await Store.findByIdAndDelete(id);
    if (!store) return { status: "fail", message: "Store not found" };

    return { status: "success", message: "Store deleted successfully" };
  } catch (error) {
    return { status: "fail", message: error.toString() };
  }
};
