import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePasswordAuth,
  updateProfile,
  uploadAvatar,
  getTutorProfile,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../controllers/authController.js";
import { protect, restrictTo, protectAdmin } from "../middleware/auth.js";
import { validateRegister, validateLogin } from "../middleware/validate.js";
import { thumbnailUpload } from "../config/cloudinary.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.get("/users/:id", getTutorProfile);

// Protected routes
router.use(protect); // All routes after this are protected
router.post("/logout", logout);
router.get("/me", getMe);
router.post("/change-password", changePasswordAuth);
router.patch("/update-profile", updateProfile);

// Admin routes - use protectAdmin middleware
router.get("/users", protectAdmin, getAllUsers);
router.put("/users/:id", protectAdmin, updateUser);
router.delete("/users/:id", protectAdmin, deleteUser);
router.patch("/users/:id/toggle-status", protectAdmin, toggleUserStatus);

// Upload avatar: if Cloudinary keys are missing, return 503 with clear message
const cloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (cloudinaryConfigured) {
  router.post("/upload-avatar", thumbnailUpload.single("avatar"), uploadAvatar);
} else {
  router.post("/upload-avatar", (req, res) => {
    res.status(503).json({
      success: false,
      message:
        "Image upload service not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    });
  });
}

export default router;
