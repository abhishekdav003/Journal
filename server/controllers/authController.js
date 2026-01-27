import User from "../models/User.js";
import crypto from "crypto";
import { generateToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Register user (student or tutor)
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Validate role
  if (!["student", "tutor"].includes(role)) {
    return next(new AppError("Role must be either student or tutor", 400));
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate input
  if (!email || !password || !role) {
    return next(new AppError("Please provide email, password and role", 400));
  }

  // Find user and include password
  const user = await User.findOne({ email, role, isActive: true }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
export const logout = catchAsync(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide email address", 400));
  }

  const user = await User.findOne({ email, isActive: true });

  if (!user) {
    return next(new AppError("No user found with that email", 404));
  }

  // Generate reset token
  const resetToken = user.generateResetToken();
  await user.save({ validateBeforeSave: false });

  // Create reset URL
  const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // TODO: Send email with resetURL
  console.log("Password Reset URL:", resetURL);

  res.status(200).json({
    success: true,
    message: "Password reset link sent to email",
  });
});

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new AppError("Please provide new password", 400));
  }

  // Hash the token from params
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
    isActive: true,
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  // Update password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Password reset successful",
    token,
  });
});

// @desc    Upload or update avatar
// @route   POST /api/auth/upload-avatar
// @access  Private
export const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload an image", 400));
  }

  const user = await User.findById(req.user._id);
  if (!user) return next(new AppError("User not found", 404));

  // Validate file data
  if (!req.file.path || !req.file.filename) {
    return next(
      new AppError("Uploaded file is missing expected metadata", 500),
    );
  }

  // Delete previous avatar if present (best-effort)
  if (user.avatarPublicId) {
    try {
      await deleteFromCloudinary(user.avatarPublicId, "image");
    } catch (err) {
      console.error(
        "Failed to delete previous avatar from Cloudinary:",
        err.message || err,
      );
      // continue without failing the request
    }
  }

  user.avatar = req.file.path;
  user.avatarPublicId = req.file.filename;
  await user.save();

  // Sanitize user before sending
  const safeUser = user.toObject();
  delete safeUser.password;
  delete safeUser.resetPasswordToken;
  delete safeUser.resetPasswordExpire;

  res.status(200).json({
    success: true,
    message: "Avatar uploaded",
    data: { user: safeUser },
  });
});

// protected
export const updateProfile = catchAsync(async (req, res, next) => {
  const allowed = ["name", "phone", "bio"];
  const updates = {};
  allowed.forEach((k) => {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: { user } });
});

// protected
export const changePasswordAuth = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    return next(new AppError("Provide old and new passwords", 400));

  const user = await User.findById(req.user._id).select("+password");
  if (!user || !(await user.comparePassword(oldPassword))) {
    return next(new AppError("Current password is incorrect", 401));
  }

  user.password = newPassword;
  await user.save();

  const token = generateToken(user._id);
  res.status(200).json({
    success: true,
    message: "Password changed",
    token,
    data: { user },
  });
});
