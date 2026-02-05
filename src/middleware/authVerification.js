import { DecodeToken } from "../utils/TokenHelper.js";





export const AuthVerification = (req, res, next) => {
  const authHeader = req.headers.authorization;
const token = authHeader?.startsWith("Bearer ")
  ? authHeader.split(" ")[1]
  : null;

  // const token = req.headers.token || req.cookies.token;
  // console.log("🛡️ Token received:", token);

  const decoded = DecodeToken(token);
  // console.log("🔐 Decoded Token:", decoded);

  if (!decoded) {
    return res.status(401).json({ status: "failed", message: "Unauthorised" });
  }

  req.headers.email = decoded.email;
  req.headers.user_id = decoded.user_id;

  next();
};