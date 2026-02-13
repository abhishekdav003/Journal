import express from "express";
import {
  uploadVideo,
  uploadThumbnail,
  deleteVideo,
  getVideoDetails,
} from "../controllers/videoController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { videoUpload, thumbnailUpload } from "../config/cloudinary.js";
import { AppError } from "../utils/appError.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(protect);
router.use(restrictTo("tutor"));

const handleUpload = (uploader, field) => (req, res, next) => {
  uploader.single(field)(req, res, (err) => {
    if (!err) return next();
    const status = err.http_code === 499 ? 504 : 400;
    return next(new AppError(err.message || "Upload failed", status));
  });
};

// Upload video
router.post("/upload", handleUpload(videoUpload, "video"), uploadVideo);

// Upload thumbnail
router.post(
  "/thumbnail",
  handleUpload(thumbnailUpload, "thumbnail"),
  uploadThumbnail
);

// Get video details
router.get("/:publicId", getVideoDetails);

// Delete video
router.delete("/:publicId", deleteVideo);

export default router;
