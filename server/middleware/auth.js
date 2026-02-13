import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// Protect routes - verify JWT token
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log in to access", 401),
    );
  }

  let decoded;
  try {
    // Verify token
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(
      new AppError("Invalid or expired token. Please log in again.", 401),
    );
  }

  // Check if user still exists
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    return next(new AppError("User no longer exists or is inactive", 401));
  }

  // Grant access to protected route
  req.user = user;
  next();
});

// Optional auth - attach user if token exists, but don't block if missing
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // If no token, continue without user
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (user && user.isActive) {
      // Attach user to request if valid
      req.user = user;
    }
  } catch (error) {
    // Invalid token - just continue without user
  }

  next();
});

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new AppError("User not found. Please log in again.", 401),
      );
    }

    const userRole = req.user.role?.toString?.()?.toLowerCase?.()?.trim?.();
    const allowedRoles = roles.map(r => r.toLowerCase());

    if (!userRole || !allowedRoles.includes(userRole)) {
      console.error(`Authorization failed: User role '${userRole}' not in allowed [${allowedRoles.join(',')}]`);
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }
    next();
  };
};
