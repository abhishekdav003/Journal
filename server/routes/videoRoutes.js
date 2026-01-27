import express from "express";
import {
  uploadVideo,
  uploadThumbnail,
  deleteVideo,
  getVideoDetails,
} from "../controllers/videoController.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { videoUpload, thumbnailUpload } from "../config/cloudinary.js";

const router = express.Router();

// All routes require authentication and tutor role
router.use(protect);
router.use(restrictTo("tutor"));

// Upload video
router.post("/upload", videoUpload.single("video"), uploadVideo);

// Upload thumbnail
router.post("/thumbnail", thumbnailUpload.single("thumbnail"), uploadThumbnail);

// Get video details
router.get("/:publicId", getVideoDetails);

// Delete video
router.delete("/:publicId", deleteVideo);

export default router;
