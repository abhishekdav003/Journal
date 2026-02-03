import Payment from "../models/Payment.js";
import { logger } from "../utils/logger.js";

// Auto-expire pending payments after 30 minutes
export const cleanupExpiredPayments = async () => {
  try {
    const result = await Payment.updateMany(
      {
        status: "pending",
        expiresAt: { $lt: new Date() },
      },
      {
        $set: { status: "expired" },
      },
    );

    if (result.modifiedCount > 0) {
      logger.info(`Expired ${result.modifiedCount} pending payments`);
    }
  } catch (error) {
    logger.error("Error cleaning up expired payments:", error);
  }
};

// Run cleanup every 5 minutes
export const startPaymentCleanup = () => {
  // Run immediately
  cleanupExpiredPayments();

  // Then run every 5 minutes
  setInterval(cleanupExpiredPayments, 5 * 60 * 1000);
  logger.info("Payment cleanup scheduler started");
};
