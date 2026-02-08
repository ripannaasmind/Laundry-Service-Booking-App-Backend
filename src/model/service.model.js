import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: "" },
    image: { type: String, default: "" },
    pricingType: { type: String, enum: ["per_kg", "per_item"], default: "per_kg" },
    pricePerKg: { type: Number, default: 0 },
    pricePerItem: { type: Number, default: 0 },
    estimatedDays: { type: Number, default: 3 },
    category: { type: String, default: "general" },
    items: [{
      name: { type: String, required: true },
      description: { type: String, default: "" },
      price: { type: Number, required: true },
      image: { type: String, default: "" },
    }],
    features: [{ type: String }],
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const Service = mongoose.model("Service", serviceSchema);
export default Service;
