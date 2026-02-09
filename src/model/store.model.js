import mongoose from "mongoose";

const operatingHoursSchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
      required: true,
    },
    openTime: { type: String, default: "08:00" },   // 24hr format "08:00"
    closeTime: { type: String, default: "22:30" },   // 24hr format "22:30"
    isClosed: { type: Boolean, default: false },
  },
  { _id: false }
);

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    
    // Address
    address: { type: String, required: true },
    area: { type: String, default: "" },         // e.g. "Gulshan 2"
    city: { type: String, default: "Dhaka" },
    state: { type: String, default: "" },
    zipCode: { type: String, default: "" },
    country: { type: String, default: "Bangladesh" },
    
    // GeoJSON location for geospatial queries (nearby stores)
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],  // [longitude, latitude]
        required: true,
      },
    },
    
    // Contact
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    
    // Images
    image: { type: String, default: "" },           // Main store image
    images: [{ type: String }],                     // Gallery images
    
    // Rating (calculated from reviews)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    
    // Operating Hours
    operatingHours: {
      type: [operatingHoursSchema],
      default: [
        { day: "monday", openTime: "08:00", closeTime: "22:30", isClosed: false },
        { day: "tuesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
        { day: "wednesday", openTime: "08:00", closeTime: "22:30", isClosed: false },
        { day: "thursday", openTime: "08:00", closeTime: "22:30", isClosed: false },
        { day: "friday", openTime: "08:00", closeTime: "22:30", isClosed: false },
        { day: "saturday", openTime: "08:00", closeTime: "22:30", isClosed: false },
        { day: "sunday", openTime: "08:00", closeTime: "22:30", isClosed: false },
      ],
    },
    
    // Services available at this store
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
    
    // Features/Amenities
    features: [{ type: String }],   // e.g. ["Free Pickup", "Express Delivery", "Dry Cleaning"]
    
    // Status
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    
    // Manager/Owner
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true, versionKey: false }
);

// 2dsphere index for geospatial queries
storeSchema.index({ location: "2dsphere" });

// Text index for search
storeSchema.index({ name: "text", address: "text", area: "text", city: "text" });

// Virtual: check if store is currently open
storeSchema.virtual("isOpen").get(function () {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const now = new Date();
  const currentDay = days[now.getDay()];
  const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

  const todayHours = this.operatingHours?.find((h) => h.day === currentDay);
  if (!todayHours || todayHours.isClosed) return false;

  return currentTime >= todayHours.openTime && currentTime <= todayHours.closeTime;
});

// Ensure virtuals are included in JSON/Object
storeSchema.set("toJSON", { virtuals: true });
storeSchema.set("toObject", { virtuals: true });

// Auto-generate slug from name
storeSchema.pre("validate", function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      + "-" + Date.now().toString(36);
  }
});

const Store = mongoose.model("Store", storeSchema);
export default Store;
