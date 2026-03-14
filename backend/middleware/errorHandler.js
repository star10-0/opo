export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = Number(err.statusCode || err.status || 500);
  const isProd = process.env.NODE_ENV === "production";
  const isServerError = statusCode >= 500;

  if (isServerError || !isProd) {
    console.error(err);
  }

  const safeMessage = isServerError
    ? "حدث خطأ داخلي غير متوقع"
    : err.message || "Request failed";

  res.status(statusCode).json({
    success: false,
    message: isProd ? safeMessage : err.message || "Server Error",
    ...(isProd ? {} : { stack: err.stack }),
  });
};
