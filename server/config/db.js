import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`MongoDB Connection Error: ${error.message}`, error);
    // Retry connection after 5 seconds instead of exiting
    setTimeout(() => {
      logger.info("Retrying MongoDB connection...");
      connectDB();
    }, 5000);
  }
};

// Handle connection events
mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB disconnected. Attempting to reconnect...");
  setTimeout(() => {
    connectDB();
  }, 5000);
});

mongoose.connection.on("error", (err) => {
  logger.error(`MongoDB connection error: ${err}`, err);
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected successfully");
});

export default connectDB;
