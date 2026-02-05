import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true, // email or phone
    },
    otp: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["email", "phone"],
      required: true,
    },
    purpose: {
      type: String,
      enum: ["registration", "login", "forgot_password"],
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false, // True when OTP is successfully verified
    },
    resetToken: {
      type: String,
      default: null, // Token generated after OTP verification
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null, // Reset token expires in 15 minutes
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Auto delete expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
