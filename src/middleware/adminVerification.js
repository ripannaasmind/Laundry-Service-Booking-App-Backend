import User from "../model/user.model.js";

export const AdminVerification = async (req, res, next) => {
  try {
    const userId = req.headers.user_id;
    const user = await User.findById(userId);
    
    if (!user || user.role !== "admin") {
      return res.status(403).json({ status: "failed", message: "Access denied. Admin only." });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ status: "failed", message: error.toString() });
  }
};
