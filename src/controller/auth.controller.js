import {
  RegisterService,
  LoginService,
  GoogleAuthService,
  ForgotPasswordService,
  VerifyForgotPasswordOTPService,
  ResetPasswordService,
  SendLoginOTPService,
  VerifyLoginOTPService,
  LogoutService,
  GetProfileService,
  UpdateProfileService,
} from "../service/auth.service.js";

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user with name, email, phone, password
 * @access  Public
 */
export const Register = async (req, res) => {
  try {
    const result = await RegisterService(req);
    const statusCode = result.status === "success" ? 201 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with email/phone and password
 * @access  Public
 */
export const Login = async (req, res) => {
  try {
    const result = await LoginService(req);
    const statusCode = result.status === "success" ? 200 : 401;
    
    if (result.status === "success") {
      // Set cookie
      const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      res.cookie("token", result.token, cookieOptions);
    }
    
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/google
 * @desc    Sign in/Sign up with Google
 * @access  Public
 */
export const GoogleAuth = async (req, res) => {
  try {
    const result = await GoogleAuthService(req);
    const statusCode = result.status === "success" ? 200 : 401;
    
    if (result.status === "success") {
      const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      res.cookie("token", result.token, cookieOptions);
    }
    
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send OTP to email/phone for password reset
 * @access  Public
 */
export const ForgotPassword = async (req, res) => {
  try {
    const result = await ForgotPasswordService(req);
    const statusCode = result.status === "success" ? 200 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/verify-forgot-otp
 * @desc    Verify OTP for password reset
 * @access  Public
 */
export const VerifyForgotPasswordOTP = async (req, res) => {
  try {
    const result = await VerifyForgotPasswordOTPService(req);
    const statusCode = result.status === "success" ? 200 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password after OTP verification
 * @access  Public
 */
export const ResetPassword = async (req, res) => {
  try {
    const result = await ResetPasswordService(req);
    const statusCode = result.status === "success" ? 200 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/send-login-otp
 * @desc    Send OTP for login (alternative to password)
 * @access  Public
 */
export const SendLoginOTP = async (req, res) => {
  try {
    const result = await SendLoginOTPService(req);
    const statusCode = result.status === "success" ? 200 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/verify-login-otp
 * @desc    Verify OTP and login
 * @access  Public
 */
export const VerifyLoginOTP = async (req, res) => {
  try {
    const result = await VerifyLoginOTPService(req);
    const statusCode = result.status === "success" ? 200 : 401;
    
    if (result.status === "success") {
      const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      };
      res.cookie("token", result.token, cookieOptions);
    }
    
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const Logout = async (req, res) => {
  try {
    const cookieOptions = {
      expires: new Date(Date.now() - 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.cookie("token", "", cookieOptions);
    
    const result = await LogoutService(req);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get user profile
 * @access  Private
 */
export const GetProfile = async (req, res) => {
  try {
    const result = await GetProfileService(req);
    const statusCode = result.status === "success" ? 200 : 404;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};

/**
 * @route   PUT /api/v1/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
export const UpdateProfile = async (req, res) => {
  try {
    const result = await UpdateProfileService(req);
    const statusCode = result.status === "success" ? 200 : 400;
    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};
