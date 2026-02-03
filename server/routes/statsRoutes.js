import express from "express";
import { getPlatformStats, getPublicReviews } from "../controllers/statsController.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/platform", getPlatformStats);
router.get("/reviews", getPublicReviews);

export default router;
