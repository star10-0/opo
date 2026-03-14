import jwt from "jsonwebtoken";
import User from "../models/User.js";

const MAX_TOKEN_LENGTH = 4096;

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token || token.length > MAX_TOKEN_LENGTH) {
    console.warn(`[SECURITY] Missing or malformed bearer token from ${req.ip}`);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(503).json({ success: false, message: "Authentication service unavailable" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    if (!decoded?.id) {
      console.warn(`[SECURITY] Token payload without user id from ${req.ip}`);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(decoded.id).select("_id role isActive stationAccess allowedStations permissions accountType station organization currentStation");

    if (!user || !user.isActive) {
      console.warn(`[SECURITY] Inactive or missing user from token: ${decoded.id}`);
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch {
    console.warn(`[SECURITY] Invalid token signature or claims from ${req.ip}`);
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default auth;
