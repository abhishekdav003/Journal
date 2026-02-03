import { AppError } from "../utils/appError.js";
import { logger } from "../utils/logger.js";

// Handle specific error types
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input: ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again", 401);

// Development error response
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

// Production error response
const sendErrorProd = (err, res) => {
  // Operational errors: send to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  // Programming or unknown errors: don't leak details
  else {
    logger.error("Unhandled Error:", err);

    res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === "CastError") error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateFields(error);
    if (err.name === "ValidationError") error = handleValidationError(error);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

// Handle 404 errors
export const notFound = (req, res, next) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found on this server`,
    404
  );
  next(error);
};