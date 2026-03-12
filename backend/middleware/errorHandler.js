export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  const status =
    err.statusCode ||
    err.status ||
    (err.name === "ValidationError" ? 400 : null) ||
    (err.name === "CastError" ? 400 : null) ||
    500;

  const message =
    err.expose || status < 500
      ? err.message
      : "Server Error";

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};
