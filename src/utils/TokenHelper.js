
import jwt from "jsonwebtoken";

export const EncodeToken = (email, user_id) => {
  const key = process.env.JWT_SECRET;
  const expire = { expiresIn: process.env.JWT_SECRET_EXPIRES_IN };
  const payload = { email, user_id };

  return jwt.sign(payload, key, expire);
};

export const DecodeToken = (token) => {
  try {
    const key = process.env.JWT_SECRET;
    return jwt.verify(token, key);
  } catch (error) {
    return null;
  }
};
