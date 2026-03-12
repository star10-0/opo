import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, message: "غير مصرح: يلزم تسجيل الدخول" });
  }

  // Development-safe demo token to keep local demos stable without relaxing production checks.
  if (token === "demo-token" && process.env.NODE_ENV !== "production") {
    req.user = {
      _id: "demo-user",
      role: req.headers["x-demo-role"] || "worker",
      name: "Demo User",
    };
    return next();
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ success: false, message: "إعدادات التوثيق غير مكتملة على الخادم" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id role name isActive");

    if (!user || user.isActive === false) {
      return res.status(401).json({ success: false, message: "المستخدم غير صالح أو غير نشط" });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ success: false, message: "رمز الدخول غير صالح أو منتهي" });
  }
};

export default auth;
