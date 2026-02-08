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
      required: false, // Not required for Google login users
      trim: true,
      default: undefined, // Use undefined instead of null for sparse index
    },
    password: {
      type: String,
      required: false, // Not required for Google login users
      minlength: 6,
      default: null,
    },
    googleId: {
      type: String,
      default: null,
      sparse: true, // Allows multiple null values but unique when set
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
      enum: ["user", "admin"],
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
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
  
  // Convert empty phone string to undefined for sparse index
  if (this.phone === '' || this.phone === null) {
    this.phone = undefined;
  }
});

// Create unique sparse index for phone (allows multiple undefined/null values)
userSchema.index({ phone: 1 }, { 
  unique: true, 
  sparse: true // Sparse index ignores documents without the field
});

const User = mongoose.model("User", userSchema);

export default User;