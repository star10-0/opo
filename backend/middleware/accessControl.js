const authEnforced = () => process.env.ENFORCE_AUTH === "true";

export const requireAuthIfEnabled = (req, res, next) => {
  if (!authEnforced()) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  next();
};

export const allowRolesIfEnabled = (roles = []) => (req, res, next) => {
  if (!authEnforced()) {
    return next();
  }

  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  next();
};
