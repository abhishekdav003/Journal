import Admin from "../models/Admin.js";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
export const adminLogin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  // Find admin and include password
  const admin = await Admin.findOne({ email, isActive: true }).select(
    "+password",
  );

  if (!admin || !(await admin.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  // Generate token with 'admin' flag
  const token = generateToken(admin._id, "admin");

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
        avatar: admin.avatar,
      },
    },
  });
});

// @desc    Get current admin
// @route   GET /api/admin/me
// @access  Private/Admin
export const getAdminProfile = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);

  if (!admin) {
    return next(new AppError("Admin not found", 404));
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: "admin",
        avatar: admin.avatar,
        lastLogin: admin.lastLogin,
      },
    },
  });
});

// @desc    Change admin password
// @route   POST /api/admin/change-password
// @access  Private/Admin
export const changeAdminPassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new AppError("Provide old and new passwords", 400));
  }

  const admin = await Admin.findById(req.admin._id).select("+password");

  if (!admin || !(await admin.comparePassword(oldPassword))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  admin.password = newPassword;
  await admin.save();

  const token = generateToken(admin._id, "admin");

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
    token,
  });
});

// @desc    Logout admin
// @route   POST /api/admin/logout
// @access  Private/Admin
export const adminLogout = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});
