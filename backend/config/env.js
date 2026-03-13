const isProd = process.env.NODE_ENV === "production";

const parseBoolean = (value, fallback = false) => {
  if (typeof value !== "string") return fallback;
  return value.toLowerCase() === "true";
};

const parseList = (value = "") =>
  String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProd,
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || "",
  jwtSecret: process.env.JWT_SECRET || "",
  enforceAuth: parseBoolean(process.env.ENFORCE_AUTH, false),
  frontendOrigins: parseList(process.env.FRONTEND_URL),
};

export const validateEnv = () => {
  const errors = [];
  const warnings = [];

  if (!env.mongoUri) {
    warnings.push("MONGO_URI is empty; database connection will fail.");
  }

  if (env.enforceAuth && !env.jwtSecret) {
    errors.push("JWT_SECRET is required when ENFORCE_AUTH=true.");
  }

  if (env.isProd) {
    if (!env.mongoUri) {
      errors.push("MONGO_URI is required in production.");
    }

    if (!env.frontendOrigins.length) {
      warnings.push("FRONTEND_URL is empty in production; CORS will allow all origins.");
    }

    if (!env.enforceAuth) {
      warnings.push("ENFORCE_AUTH=false in production.");
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
};
