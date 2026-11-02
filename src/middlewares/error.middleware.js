const { env } = require("../config/env");

/**
 * Fallback middleware for unmatched routes (404 Not Found).
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: "Not Found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global application error handler.
 */
const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Error:", err.stack || err.message);

  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    error: err.name || "ServerError",
    message: err.message || "An unexpected internal server error occurred",
    ...(env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
