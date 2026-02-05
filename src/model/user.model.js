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
      default: null,
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
});

// Create unique index for phone that allows null values
userSchema.index({ phone: 1 }, { 
  unique: true, 
  sparse: true, // Only enforce uniqueness when phone is not null
  partialFilterExpression: { phone: { $type: 'string', $ne: null } }
});

const User = mongoose.model("User", userSchema);

export default User;