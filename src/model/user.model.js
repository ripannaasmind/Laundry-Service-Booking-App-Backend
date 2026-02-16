import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: undefined,
    },
    password: {
      type: String,
      required: false,
      minlength: 6,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileImage: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "admin", "delivery", "staff"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    // Delivery boy specific fields
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [90.4125, 23.8103], // Default Dhaka
      },
    },
    assignedStore: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },
    // Earnings tracking for delivery boys
    totalEarnings: {
      type: Number,
      default: 0,
    },
    pendingEarnings: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Custom validation: Either password OR googleId must be present
userSchema.pre('save', function() {
  if (!this.password && !this.googleId) {
    throw new Error('Either password or Google authentication is required');
  }
  
  if (this.phone === '' || this.phone === null) {
    this.phone = undefined;
  }
});

// 2dsphere index for delivery boy location queries
userSchema.index({ currentLocation: "2dsphere" });

// Create unique sparse index for phone
userSchema.index({ phone: 1 }, { 
  unique: true, 
  sparse: true 
});

const User = mongoose.model("User", userSchema);

export default User;
