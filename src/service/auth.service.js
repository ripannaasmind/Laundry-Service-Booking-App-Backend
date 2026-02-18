import User from "../model/user.model.js";
import OTP from "../model/otp.model.js";
import bcrypt from "bcryptjs";
import { EncodeToken } from "../utils/TokenHelper.js";
import { EmailSend } from "../utils/emailHelper.js";
import { SendOtpSms } from "../utils/smsHelper.js";
import admin from "../config/firebase.js";
import { parsePhoneNumber, getCountries } from 'libphonenumber-js';

// DEV MODE: When email/SMS credentials are invalid, OTP is logged to console and returned in response
const IS_DEV = process.env.NODE_ENV !== 'production';

/**
 * Send OTP via email or SMS with graceful fallback in dev mode
 * If both email and SMS fail, returns the OTP in the response (dev only)
 */
const sendOtpNotification = async (user, otp, isEmail, emailOrPhone, purpose) => {
  const purposeLabel = purpose === 'forgot_password' ? 'password reset' : 'login';
  
  // Try sending via the primary channel
  if (isEmail) {
    try {
      const emailText = `Your ${purposeLabel} OTP is: ${otp}. Valid for 10 minutes.`;
      const emailSubject = `${purposeLabel.charAt(0).toUpperCase() + purposeLabel.slice(1)} OTP - Ultra Wash`;
      await EmailSend(emailOrPhone, emailText, emailSubject);
      return { sent: true, channel: 'email', message: `OTP sent to your email` };
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError.message);
    }
  } else {
    // Try SMS first
    try {
      await SendOtpSms(user.phone, otp);
      return { sent: true, channel: 'sms', message: `OTP sent to your phone` };
    } catch (smsError) {
      console.log('⚠️ SMS failed, trying email fallback...');
      
      // Try email fallback
      if (user.email) {
        try {
          const emailText = `Your ${purposeLabel} OTP is: ${otp}. Valid for 10 minutes.\n\nNote: SMS service is temporarily unavailable, so we sent this code via email.`;
          const emailSubject = `${purposeLabel.charAt(0).toUpperCase() + purposeLabel.slice(1)} OTP - Ultra Wash`;
          await EmailSend(user.email, emailText, emailSubject);
          const maskedEmail = `${user.email.substring(0, 3)}***@${user.email.split('@')[1]}`;
          return { sent: true, channel: 'email', message: `SMS unavailable. OTP sent to email: ${maskedEmail}` };
        } catch (emailError) {
          console.error('❌ Email fallback also failed:', emailError.message);
        }
      }
    }
  }
  
  // Both SMS and Email failed — DEV MODE fallback
  if (IS_DEV) {
    console.log('');
    console.log('╔══════════════════════════════════════════════════╗');
    console.log('║  🔧 DEV MODE — OTP DELIVERY SIMULATED           ║');
    console.log(`║  📧 User: ${user.email || emailOrPhone}                   `);
    console.log(`║  �� OTP:  ${otp}                               ║`);
    console.log(`║  📋 Purpose: ${purpose}                         ║`);
    console.log('║  ⏱️  Valid for: 10 minutes                       ║');
    console.log('╚══════════════════════════════════════════════════╝');
    console.log('');
    return { 
      sent: false, 
      devMode: true, 
      channel: 'console', 
      message: `[Dev Mode] OTP: ${otp} — Email/SMS services unavailable. Check server console.`,
      otp: otp 
    };
  }
  
  throw new Error('Failed to send OTP. Both email and SMS services are unavailable.');
};
/**
 * Normalize phone number to E.164 format
 * Tries multiple strategies to detect the correct country code
 * Supports ALL 245 countries
 */
const normalizePhoneNumber = (phone) => {
  try {
    const cleaned = phone.trim();
    
    console.log(`\n📱 NORMALIZING PHONE: "${cleaned}"`);
    
    // STEP 1: If already has + and valid, return immediately
    if (cleaned.startsWith('+')) {
      try {
        const phoneNumber = parsePhoneNumber(cleaned);
        if (phoneNumber && phoneNumber.isValid()) {
          console.log(`✅ Already valid: ${cleaned} → ${phoneNumber.format('E.164')} (${phoneNumber.country})`);
          return phoneNumber.format('E.164');
        }
      } catch (e) {}
    }
    
    // STEP 2: Try adding + prefix (user may have entered country code without +)
    // Example: "61293425678" → "+61293425678" (Australia)
    if (!cleaned.startsWith('+') && !cleaned.startsWith('0')) {
      try {
        const withPlus = `+${cleaned}`;
        const phoneNumber = parsePhoneNumber(withPlus);
        if (phoneNumber && phoneNumber.isValid()) {
          console.log(`✅ Added + prefix: ${cleaned} → ${phoneNumber.format('E.164')} (${phoneNumber.country})`);
          return phoneNumber.format('E.164');
        }
      } catch (e) {}
    }
    
    // STEP 3: Smart pattern matching based on number format
    // Try specific countries based on phone number patterns FIRST
    const patternMatches = detectCountryByPattern(cleaned);
    for (const country of patternMatches) {
      try {
        const phoneNumber = parsePhoneNumber(cleaned, country);
        if (phoneNumber && phoneNumber.isValid()) {
          console.log(`✅ Pattern match: ${cleaned} → ${phoneNumber.format('E.164')} (${country})`);
          return phoneNumber.format('E.164');
        }
      } catch (e) { continue; }
    }
    
    // STEP 4: Try ALL countries as last resort
    const allCountries = getCountries();
    for (const country of allCountries) {
      try {
        const phoneNumber = parsePhoneNumber(cleaned, country);
        if (phoneNumber && phoneNumber.isValid()) {
          console.log(`✅ Fallback match: ${cleaned} → ${phoneNumber.format('E.164')} (${country})`);
          return phoneNumber.format('E.164');
        }
      } catch (e) { continue; }
    }
    
    // STEP 5: Return with + prefix as last resort
    const result = cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
    console.log(`⚠️ No valid country found, fallback: ${result}`);
    return result;
    
  } catch (error) {
    console.error('❌ Phone normalization error:', error.message);
    const cleaned = phone.trim();
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }
};

/**
 * Detect likely countries based on phone number pattern
 * Returns array of country codes to try in priority order
 */
const detectCountryByPattern = (phone) => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  const countries = [];
  
  // === Numbers starting with 0 (local format) ===
  
  // Bangladesh: 01XXXXXXXXX (11 digits starting with 01)
  if (/^01[3-9]\d{8}$/.test(cleaned)) countries.push('BD');
  
  // UK: 07XXXXXXXXX (11 digits starting with 07)
  if (/^07\d{9}$/.test(cleaned)) countries.push('GB');
  
  // Australia: 04XXXXXXXX (10 digits starting with 04)
  if (/^04\d{8}$/.test(cleaned)) countries.push('AU');
  
  // Germany: 01XXXXXXXX (starts with 01, 11-12 digits)
  if (/^0[1-9]\d{9,10}$/.test(cleaned) && !countries.includes('BD')) countries.push('DE');
  
  // Indonesia: 08XXXXXXXXXX (starts with 08, 10-13 digits)
  if (/^08\d{8,11}$/.test(cleaned)) countries.push('ID');
  
  // Malaysia: 01XXXXXXXXX (starts with 01, 10-11 digits)
  if (/^01[0-9]\d{7,8}$/.test(cleaned) && !countries.includes('BD')) countries.push('MY');
  
  // Thailand: 0[689]XXXXXXXX (starts with 06/08/09, 10 digits)
  if (/^0[689]\d{8}$/.test(cleaned)) countries.push('TH');
  
  // Japan: 0X0XXXXXXXX (starts with 0, 10-11 digits)  
  if (/^0[1-9]0\d{7,8}$/.test(cleaned)) countries.push('JP');
  
  // === Numbers NOT starting with 0 (no local prefix) ===
  
  // India: 10 digits starting with 6-9
  if (/^[6-9]\d{9}$/.test(cleaned)) countries.push('IN');
  
  // USA/Canada: 10 digits, area code starts with 2-9
  if (/^[2-9]\d{9}$/.test(cleaned)) countries.push('US', 'CA');
  
  // Pakistan: 3XXXXXXXXX (10 digits starting with 3)
  if (/^3[0-9]\d{8}$/.test(cleaned)) countries.push('PK');
  
  // Saudi Arabia: 5XXXXXXXX (9 digits starting with 5)
  if (/^5[0-9]\d{7}$/.test(cleaned)) countries.push('SA');
  
  // UAE: 5XXXXXXXX (9 digits starting with 5)
  if (/^5[0-9]\d{7}$/.test(cleaned)) countries.push('AE');
  
  // Egypt: 1XXXXXXXXX (10 digits starting with 1)
  if (/^1[0-2]\d{8}$/.test(cleaned)) countries.push('EG');
  
  // Nigeria: 70-90XXXXXXXX (11 digits)
  if (/^[789]0\d{8}$/.test(cleaned)) countries.push('NG');
  
  // Turkey: 5XXXXXXXXX (10 digits starting with 5)
  if (/^5\d{9}$/.test(cleaned)) countries.push('TR');
  
  // South Korea: 10-11XXXXXXXX (10-11 digits starting with 10/11)
  if (/^1[01]\d{8}$/.test(cleaned)) countries.push('KR');
  
  // Brazil: 11 digits
  if (/^[1-9]\d{10}$/.test(cleaned)) countries.push('BR');
  
  // Philippines: 9XXXXXXXXX (10 digits starting with 9)
  if (/^9\d{9}$/.test(cleaned)) countries.push('PH');
  
  // Vietnam: 0XXXXXXXXX or 3/5/7/8/9XXXXXXXX
  if (/^[35789]\d{8}$/.test(cleaned)) countries.push('VN');
  
  // China: 1XXXXXXXXXX (11 digits starting with 1)
  if (/^1[3-9]\d{9}$/.test(cleaned)) countries.push('CN');
  
  // Singapore: 8/9XXXXXXX (8 digits starting with 8/9)
  if (/^[89]\d{7}$/.test(cleaned)) countries.push('SG');
  
  // Nepal: 9XXXXXXXXX (10 digits starting with 9)
  if (/^9[78]\d{8}$/.test(cleaned)) countries.push('NP');
  
  // Sri Lanka: 7XXXXXXXX (9 digits starting with 7)
  if (/^7\d{8}$/.test(cleaned)) countries.push('LK');
  
  // Myanmar: 9XXXXXXXX (9-10 digits)
  if (/^9\d{7,9}$/.test(cleaned)) countries.push('MM');
  
  // Iraq: 7XXXXXXXXX (10 digits starting with 7)
  if (/^7[3-9]\d{8}$/.test(cleaned)) countries.push('IQ');
  
  // Iran: 9XXXXXXXXX (10 digits starting with 9)
  if (/^9[0-9]\d{8}$/.test(cleaned)) countries.push('IR');
  
  // Kenya: 7XXXXXXXX (9 digits starting with 7)
  if (/^7\d{8}$/.test(cleaned)) countries.push('KE');
  
  // South Africa: 6-8XXXXXXXX (9 digits)
  if (/^[6-8]\d{8}$/.test(cleaned)) countries.push('ZA');
  
  // Morocco: 6-7XXXXXXXX (9 digits starting with 6/7)
  if (/^[67]\d{8}$/.test(cleaned)) countries.push('MA');
  
  // Mexico: 10 digits
  if (/^[1-9]\d{9}$/.test(cleaned)) countries.push('MX');
  
  // Argentina: 11 digits
  if (/^[1-9]\d{9,10}$/.test(cleaned)) countries.push('AR');
  
  // France: 06/07XXXXXXXX
  if (/^0[67]\d{8}$/.test(cleaned)) countries.push('FR');
  
  // Italy: 3XXXXXXXXX
  if (/^3\d{9}$/.test(cleaned)) countries.push('IT');
  
  // Spain: 6/7XXXXXXXX (9 digits)
  if (/^[67]\d{8}$/.test(cleaned)) countries.push('ES');
  
  // Russia: 9XXXXXXXXX (10 digits)
  if (/^9\d{9}$/.test(cleaned)) countries.push('RU');
  
  // New Zealand: 02XXXXXXXXX
  if (/^02\d{7,9}$/.test(cleaned)) countries.push('NZ');
  
  // Kuwait: 5/6/9XXXXXXX (8 digits)
  if (/^[569]\d{7}$/.test(cleaned)) countries.push('KW');
  
  // Qatar: 3/5/6/7XXXXXXX (8 digits)
  if (/^[3567]\d{7}$/.test(cleaned)) countries.push('QA');
  
  // Bahrain: 3XXXXXXX (8 digits)
  if (/^3\d{7}$/.test(cleaned)) countries.push('BH');
  
  // Oman: 7/9XXXXXXX (8 digits)
  if (/^[79]\d{7}$/.test(cleaned)) countries.push('OM');
  
  console.log(`🔎 Pattern detection for "${phone}":`, countries.length > 0 ? countries.join(', ') : 'no pattern match');
  
  return countries;
};

/**
 * Get all possible E.164 formats for a phone number
 * Used for searching in the database
 * Example: "293425678" → ["+293425678", "+61293425678", "+88293425678", ...]
 */
const getAllPossiblePhoneFormats = (phone) => {
  const cleaned = phone.trim();
  const formats = new Set();
  
  // Add the normalized version
  const normalized = normalizePhoneNumber(cleaned);
  formats.add(normalized);
  
  // Add original with + prefix
  if (!cleaned.startsWith('+')) {
    formats.add(`+${cleaned}`);
  }
  formats.add(cleaned);
  
  // If already has +, parse it
  if (cleaned.startsWith('+')) {
    try {
      const phoneNumber = parsePhoneNumber(cleaned);
      if (phoneNumber && phoneNumber.isValid()) {
        formats.add(phoneNumber.format('E.164'));
        formats.add(phoneNumber.formatNational().replace(/[\s()-]/g, ''));
      }
    } catch (e) {}
  }
  
  // Try + prefix version
  if (!cleaned.startsWith('+')) {
    try {
      const withPlus = `+${cleaned}`;
      const phoneNumber = parsePhoneNumber(withPlus);
      if (phoneNumber && phoneNumber.isValid()) {
        formats.add(phoneNumber.format('E.164'));
      }
    } catch (e) {}
  }
  
  // Try all countries to find all possible matches
  const allCountries = getCountries();
  for (const country of allCountries) {
    try {
      const phoneNumber = parsePhoneNumber(cleaned, country);
      if (phoneNumber && phoneNumber.isValid()) {
        formats.add(phoneNumber.format('E.164'));
      }
    } catch (e) {
      continue;
    }
  }
  
  const result = [...formats];
  console.log(`🔍 Possible formats for "${cleaned}":`, result);
  return result;
};

/**
 * Find user by email or phone (searches all possible phone formats)
 */
const findUserByEmailOrPhone = async (emailOrPhone) => {
  const isEmail = emailOrPhone.includes('@');
  
  if (isEmail) {
    return await User.findOne({ email: emailOrPhone.toLowerCase() });
  }
  
  // Get all possible phone formats and search for any match
  const phoneFormats = getAllPossiblePhoneFormats(emailOrPhone);
  
  const user = await User.findOne({
    phone: { $in: phoneFormats }
  });
  
  if (user) {
    console.log(`✅ User found with phone: ${user.phone}`);
  } else {
    console.log(`❌ No user found for any format of: ${emailOrPhone}`);
  }
  
  return user;
};

/**
 * Find OTP record by identifier (searches all possible phone formats)
 */
const findOTPRecord = async (emailOrPhone, otp, purpose) => {
  const isEmail = emailOrPhone.includes('@');
  
  if (isEmail) {
    return await OTP.findOne({
      identifier: emailOrPhone.toLowerCase(),
      otp,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    });
  }
  
  // Get all possible phone formats
  const phoneFormats = getAllPossiblePhoneFormats(emailOrPhone);
  
  return await OTP.findOne({
    identifier: { $in: phoneFormats },
    otp,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
};

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

    // Normalize phone number to international format
    const normalizedPhone = normalizePhoneNumber(phone);
    console.log(`📱 Phone normalization: ${phone} → ${normalizedPhone}`);

    // Check if user already exists with normalized phone
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return { status: "failed", message: "Email already registered" };
      }
      return { status: "failed", message: "Phone number already registered" };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user with normalized phone
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      phone: normalizedPhone,
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

    console.log(`🔐 Login attempt: ${emailOrPhone}`);

    // Find user by email or phone (searches all possible formats)
    const user = await findUserByEmailOrPhone(emailOrPhone);

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
        role: user.role,
        profileImage: user.profileImage,
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
        // Don't set phone field - let it be undefined for Google users
        password: undefined, // No password for Google users
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
        role: user.role,
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

    const isEmail = emailOrPhone.includes('@');

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 FORGOT PASSWORD REQUEST');
    console.log('Input:', emailOrPhone);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Find user by email or phone (searches all possible formats)
    const user = await findUserByEmailOrPhone(emailOrPhone);

    console.log('User found:', user ? `Yes (${user.email}, phone: ${user.phone})` : 'No');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Generate OTP
    const otp = generateOTP();

    // Use the phone stored in DB as the OTP identifier for phone-based requests
    const otpIdentifier = isEmail ? emailOrPhone.toLowerCase() : user.phone;

    // Delete any existing OTPs
    await OTP.deleteMany({
      identifier: otpIdentifier,
      purpose: "forgot_password",
    });

    // Save OTP to database
    await OTP.create({
      identifier: otpIdentifier,
      otp,
      type: isEmail ? "email" : "phone",
      purpose: "forgot_password",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP via email or SMS (with dev mode fallback)
    const sendResult = await sendOtpNotification(user, otp, isEmail, emailOrPhone, "forgot_password");

    const response = {
      status: "success",
      message: sendResult.message,
      type: sendResult.channel === 'sms' ? 'phone' : 'email',
    };
    // In dev mode, include OTP in response for testing
    if (sendResult.devMode) {
      response.devOtp = otp;
    }
    return response;
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

    // Find OTP record (searches all possible phone formats)
    const otpRecord = await findOTPRecord(emailOrPhone, otp, "forgot_password");

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
    // Search all possible phone formats for OTP record
    const isEmail = emailOrPhone.includes('@');
    let otpRecord;
    
    if (isEmail) {
      otpRecord = await OTP.findOne({
        identifier: emailOrPhone.toLowerCase(),
        purpose: "forgot_password",
        isVerified: true,
        resetToken: resetToken,
        resetTokenExpiresAt: { $gt: new Date() },
      });
    } else {
      const phoneFormats = getAllPossiblePhoneFormats(emailOrPhone);
      otpRecord = await OTP.findOne({
        identifier: { $in: phoneFormats },
        purpose: "forgot_password",
        isVerified: true,
        resetToken: resetToken,
        resetTokenExpiresAt: { $gt: new Date() },
      });
    }

    if (!otpRecord) {
      return { 
        status: "failed", 
        message: "Invalid or expired reset token. Please verify OTP again." 
      };
    }

    // Find user (searches all possible formats)
    const user = await findUserByEmailOrPhone(emailOrPhone);

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    user.password = hashedPassword;
    await user.save();

    // Delete all OTPs for this user (cleanup)
    const cleanupIdentifiers = isEmail ? [emailOrPhone.toLowerCase()] : getAllPossiblePhoneFormats(emailOrPhone);
    await OTP.deleteMany({
      identifier: { $in: cleanupIdentifiers },
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

    const isEmail = emailOrPhone.includes('@');
    console.log(`📲 Send Login OTP: ${emailOrPhone}`);

    // Find user (searches all possible phone formats)
    const user = await findUserByEmailOrPhone(emailOrPhone);

    if (!user) {
      return { status: "failed", message: "User not found. Please register first." };
    }

    // Generate OTP
    const otp = generateOTP();

    // Use user's DB phone as OTP identifier for phone requests
    const otpIdentifier = isEmail ? emailOrPhone.toLowerCase() : user.phone;

    // Delete existing OTPs
    await OTP.deleteMany({
      identifier: otpIdentifier,
      purpose: "login",
    });

    // Save OTP
    await OTP.create({
      identifier: otpIdentifier,
      otp,
      type: isEmail ? "email" : "phone",
      purpose: "login",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP via email or SMS (with dev mode fallback)
    const sendResult = await sendOtpNotification(user, otp, isEmail, emailOrPhone, "login");

    const response = {
      status: "success",
      message: sendResult.message,
    };
    // In dev mode, include OTP in response for testing
    if (sendResult.devMode) {
      response.devOtp = otp;
    }
    return response;
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

    // Find OTP record (searches all possible phone formats)
    const otpRecord = await findOTPRecord(emailOrPhone, otp, "login");

    if (!otpRecord) {
      return { status: "failed", message: "Invalid or expired OTP" };
    }

    // Mark OTP as used
    otpRecord.isUsed = true;
    await otpRecord.save();

    // Find user (searches all possible formats)
    const user = await findUserByEmailOrPhone(emailOrPhone);

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
    const { name, phone, profileImage, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return { status: "failed", message: "User not found" };
    }

    // Update name
    if (name !== undefined && name.trim() !== "") {
      user.name = name.trim();
    }

    // Update phone (with normalization & duplicate check)
    if (phone !== undefined) {
      const cleanPhone = phone.trim();
      
      if (cleanPhone === "" || cleanPhone === null) {
        // Allow clearing phone
        user.phone = undefined;
      } else {
        // Normalize the phone number
        const normalizedPhone = normalizePhoneNumber(cleanPhone);
        
        // Check if normalized phone is different from current
        const currentNormalized = user.phone ? normalizePhoneNumber(user.phone) : null;
        
        if (normalizedPhone !== currentNormalized) {
          // Check if phone already exists for another user
          const phoneFormats = getAllPossiblePhoneFormats(cleanPhone);
          const existingPhone = await User.findOne({
            phone: { $in: phoneFormats },
            _id: { $ne: userId },
          });
          
          if (existingPhone) {
            return { status: "failed", message: "Phone number already in use" };
          }
          user.phone = normalizedPhone;
        }
      }
    }

    // Update profile image
    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    return {
      status: "success",
      message: "Profile updated successfully",
      data: updatedUser,
    };
  } catch (e) {
    return { status: "failed", message: e.toString() };
  }
};
