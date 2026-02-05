import User from "../model/user.model.js";
import OTP from "../model/otp.model.js";
import bcrypt from "bcryptjs";
import { EncodeToken } from "../utils/TokenHelper.js";
import { EmailSend } from "../utils/emailHelper.js";
import { SendOtpSms } from "../utils/smsHelper.js";
import admin from "../config/firebase.js";

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Compare password
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Register new user with email and phone
 * Required: name, email, phone, password, confirmPassword
 */
export const RegisterService = async (req) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      return { status: "failed", message: "All fields are required" };
    }

    if (password !== confirmPassword) {
      return { status: "failed", message: "Passwords do not match" };
    }

    if (password.length < 6) {
      return { status: "failed", message: "Password must be at least 6 characters" };
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return { status: "failed", message: "Email already registered" };
      }
      return { status: "failed", message: "Phone number already registered" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
      isVerified: true,
    });

    // Generate token
    const token = EncodeToken(newUser.email, newUser._id.toString());

    return {
      status: "success",
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Login with email or phone + password
 */
export const LoginService = async (req) => {
  try {
    const { emailOrPhone, password } = req.body;

    if (!emailOrPhone || !password) {
      return { status: "failed", message: "Email/Phone and password are required" };
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Check if user registered with Google (no password)
    if (!user.password) {
      return { status: "failed", message: "Please login with Google" };
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return { status: "failed", message: "Invalid password" };
    }

    // Generate token
    const token = EncodeToken(user.email, user._id.toString());

    return {
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Google Sign In/Sign Up
 * Required: idToken from Firebase client
 */
export const GoogleAuthService = async (req) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return { status: "failed", message: "Google ID token is required" };
    }

    console.log("🔐 Verifying Google ID token...");

    // Verify the ID token with Firebase Admin
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (verifyError) {
      console.error("❌ Firebase token verification failed:", verifyError.message);
      return { status: "failed", message: "Invalid Google token. Please try again." };
    }

    const { uid, email, name, picture } = decodedToken;

    if (!email) {
      return { status: "failed", message: "Email not provided by Google" };
    }

    console.log("✅ Google token verified for:", email);

    // Check if user exists
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      console.log("👤 Existing user found, updating Google info...");
      
      // Update Google ID if not already set
      if (!user.googleId) {
        user.googleId = uid;
        user.isVerified = true;
      }
      
      // Update profile image if available and not set
      if (picture && !user.profileImage) {
        user.profileImage = picture;
      }
      
      // Update name if user's name is empty or default
      if (name && (!user.name || user.name === "Google User")) {
        user.name = name;
      }
      
      await user.save();
      console.log("✅ User updated successfully");
    } else {
      console.log("🆕 Creating new user with Google account...");
      
      // Create new user with Google authentication
      user = await User.create({
        name: name || email.split('@')[0] || "Google User",
        email: email.toLowerCase(),
        phone: "", // Optional: User can add phone later
        password: null, // No password for Google users
        googleId: uid,
        profileImage: picture || "",
        isVerified: true,
      });
      
      console.log("✅ New user created successfully:", user._id);
    }

    // Generate JWT token
    const token = EncodeToken(user.email, user._id.toString());

    return {
      status: "success",
      message: user.isNew ? "Account created successfully with Google" : "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    };
  } catch (e) {
    console.error("❌ Google authentication error:", e);
    return { 
      status: "failed", 
      message: "Google authentication failed. Please try again.",
      error: e.message 
    };
  }
};

/**
 * Forgot Password - Send OTP to email or phone
 */
export const ForgotPasswordService = async (req) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return { status: "failed", message: "Email or phone is required" };
    }

    // Find user by email or phone
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Generate OTP
    const otp = generateOTP();
    const isEmail = emailOrPhone.includes("@");

    // Delete any existing OTPs for this identifier
    await OTP.deleteMany({
      identifier: emailOrPhone.toLowerCase(),
      purpose: "forgot_password",
    });

    // Save OTP to database
    await OTP.create({
      identifier: isEmail ? emailOrPhone.toLowerCase() : emailOrPhone,
      otp,
      type: isEmail ? "email" : "phone",
      purpose: "forgot_password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP via email or SMS
    if (isEmail) {
      const emailText = `Your password reset OTP is: ${otp}. Valid for 10 minutes.`;
      const emailSubject = "Password Reset OTP - Ultra Wash";
      await EmailSend(emailOrPhone, emailText, emailSubject);
    } else {
      // Send OTP via SMS
      await SendOtpSms(emailOrPhone, otp);
    }

    return {
      status: "success",
      message: `OTP sent to your ${isEmail ? "email" : "phone"}`,
      type: isEmail ? "email" : "phone",
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Verify OTP for forgot password
 */
export const VerifyForgotPasswordOTPService = async (req) => {
  try {
    const { emailOrPhone, otp } = req.body;

    if (!emailOrPhone || !otp) {
      return { status: "failed", message: "Email/Phone and OTP are required" };
    }

    // Find valid OTP
    const otpRecord = await OTP.findOne({
      identifier: emailOrPhone.toLowerCase(),
      otp,
      purpose: "forgot_password",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return { status: "failed", message: "Invalid or expired OTP" };
    }

    // Generate reset token
    const resetToken = Buffer.from(emailOrPhone + ":" + Date.now() + ":" + Math.random().toString(36)).toString("base64");
    
    // Mark OTP as used and verified, save resetToken
    otpRecord.isUsed = true;
    otpRecord.isVerified = true;
    otpRecord.resetToken = resetToken;
    otpRecord.resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity
    await otpRecord.save();

    return {
      status: "success",
      message: "OTP verified successfully",
      resetToken: resetToken,
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Reset Password after OTP verification
 * IMPORTANT: resetToken must be valid (from verify-forgot-otp)
 */
export const ResetPasswordService = async (req) => {
  try {
    const { emailOrPhone, newPassword, confirmPassword, resetToken } = req.body;

    // Validate all required fields
    if (!emailOrPhone || !newPassword || !confirmPassword || !resetToken) {
      return { status: "failed", message: "All fields are required including reset token" };
    }

    if (newPassword !== confirmPassword) {
      return { status: "failed", message: "Passwords do not match" };
    }

    if (newPassword.length < 6) {
      return { status: "failed", message: "Password must be at least 6 characters" };
    }

    // ✅ IMPORTANT: Verify resetToken is valid and not expired
    const otpRecord = await OTP.findOne({
      identifier: emailOrPhone.toLowerCase(),
      purpose: "forgot_password",
      isVerified: true,
      resetToken: resetToken,
      resetTokenExpiresAt: { $gt: new Date() }, // Token must not be expired
    });

    if (!otpRecord) {
      return { 
        status: "failed", 
        message: "Invalid or expired reset token. Please verify OTP again." 
      };
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete all OTPs for this user (cleanup)
    await OTP.deleteMany({
      identifier: emailOrPhone.toLowerCase(),
    });

    return {
      status: "success",
      message: "Password reset successfully",
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Send OTP for login
 */
export const SendLoginOTPService = async (req) => {
  try {
    const { emailOrPhone } = req.body;

    if (!emailOrPhone) {
      return { status: "failed", message: "Email or phone is required" };
    }

    // Find user
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!user) {
      return { status: "failed", message: "User not found. Please register first." };
    }

    // Generate OTP
    const otp = generateOTP();
    const isEmail = emailOrPhone.includes("@");

    // Delete existing OTPs
    await OTP.deleteMany({
      identifier: emailOrPhone.toLowerCase(),
      purpose: "login",
    });

    // Save OTP
    await OTP.create({
      identifier: isEmail ? emailOrPhone.toLowerCase() : emailOrPhone,
      otp,
      type: isEmail ? "email" : "phone",
      purpose: "login",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP via email or SMS
    if (isEmail) {
      const emailText = `Your login OTP is: ${otp}. Valid for 10 minutes.`;
      const emailSubject = "Login OTP - Ultra Wash";
      await EmailSend(emailOrPhone, emailText, emailSubject);
    } else {
      // Send OTP via SMS
      await SendOtpSms(emailOrPhone, otp);
    }

    return {
      status: "success",
      message: `OTP sent to your ${isEmail ? "email" : "phone"}`,
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Verify OTP and Login
 */
export const VerifyLoginOTPService = async (req) => {
  try {
    const { emailOrPhone, otp } = req.body;

    if (!emailOrPhone || !otp) {
      return { status: "failed", message: "Email/Phone and OTP are required" };
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({
      identifier: emailOrPhone.toLowerCase(),
      otp,
      purpose: "login",
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord) {
      return { status: "failed", message: "Invalid or expired OTP" };
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find user
    const user = await User.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phone: emailOrPhone },
      ],
    });

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Generate token
    const token = EncodeToken(user.email, user._id.toString());

    return {
      status: "success",
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Logout user
 */
export const LogoutService = async (req) => {
  try {
    return {
      status: "success",
      message: "Logged out successfully",
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Get user profile
 */
export const GetProfileService = async (req) => {
  try {
    const userId = req.headers.user_id;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    return {
      status: "success",
      data: user,
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};

/**
 * Update user profile
 */
export const UpdateProfileService = async (req) => {
  try {
    const userId = req.headers.user_id;
    const { name, phone } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Check if phone already exists for another user
    if (phone && phone !== user.phone) {
      const existingPhone = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingPhone) {
        return { status: "failed", message: "Phone number already in use" };
      }
      user.phone = phone;
    }

    if (name) user.name = name;

    await user.save();

    return {
      status: "success",
      message: "Profile updated successfully",
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
