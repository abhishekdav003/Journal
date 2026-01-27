import { cloudinary, deleteFromCloudinary } from "../config/cloudinary.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Upload video to Cloudinary
// @route   POST /api/videos/upload
// @access  Private/Tutor
export const uploadVideo = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload a video file", 400));
  }

  const videoData = {
    url: req.file.path,
    publicId: req.file.filename,
    duration: req.file.duration || 0,
    format: req.file.format,
    size: req.file.bytes,
  };

  res.status(200).json({
    success: true,
    message: "Video uploaded successfully",
    data: { video: videoData },
  });
});

// @desc    Upload thumbnail to Cloudinary
// @route   POST /api/videos/thumbnail
// @access  Private/Tutor
export const uploadThumbnail = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Please upload a thumbnail image", 400));
  }

  const thumbnailData = {
    url: req.file.path,
    publicId: req.file.filename,
  };

  res.status(200).json({
    success: true,
    message: "Thumbnail uploaded successfully",
    data: { thumbnail: thumbnailData },
  });
});

// @desc    Get video details from Cloudinary
// @route   GET /api/videos/:publicId
// @access  Private/Tutor
export const getVideoDetails = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;

  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: "video",
    });

    res.status(200).json({
      success: true,
      data: {
        video: {
          url: result.secure_url,
          publicId: result.public_id,
          duration: result.duration,
          format: result.format,
          size: result.bytes,
        },
      },
    });
  } catch (error) {
    return next(new AppError("Video not found", 404));
  }
});

// @desc    Delete video from Cloudinary
// @route   DELETE /api/videos/:publicId
// @access  Private/Tutor
export const deleteVideo = catchAsync(async (req, res, next) => {
  const { publicId } = req.params;

  const deleted = await deleteFromCloudinary(publicId, "video");

  if (!deleted) {
    return next(new AppError("Failed to delete video", 500));
  }

  res.status(200).json({
    success: true,
    message: "Video deleted successfully",
  });
});
