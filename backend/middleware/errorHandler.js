export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `المسار غير موجود: ${req.method} ${req.originalUrl}`,
  });
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "حدث خطأ غير متوقع في الخادم";

  if (statusCode >= 500) {
    console.error("[SERVER_ERROR]", {
      path: req.originalUrl,
      method: req.method,
      message,
      stack: err.stack,
    });
  } else {
    console.warn("[REQUEST_ERROR]", {
      path: req.originalUrl,
      method: req.method,
      message,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
