import User from "../model/user.model.js";

// Generic role verification middleware factory
export const RoleVerification = (...roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.headers.user_id;
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ status: "failed", message: "User not found" });
      }
      
      if (!roles.includes(user.role)) {
        return res.status(403).json({ 
          status: "failed", 
          message: `Access denied. Required role: ${roles.join(' or ')}` 
        });
      }
      
      // Attach user to request for use in controllers
      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ status: "failed", message: error.toString() });
    }
  };
};

// Specific convenience middleware
export const DeliveryVerification = RoleVerification("delivery");
export const StaffVerification = RoleVerification("staff");
export const AdminOrStaffVerification = RoleVerification("admin", "staff");
