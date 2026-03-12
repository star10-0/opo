export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = Number(err.statusCode || err.status || 500);
  const isProd = process.env.NODE_ENV === "production";

  if (!isProd) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    ...(isProd ? {} : { stack: err.stack }),
  });
};
