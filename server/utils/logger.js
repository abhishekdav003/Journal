// Production-level logging utility
// Replace console.log with proper logging in production

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  info: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
    // In production, send to logging service (e.g., Winston, Datadog)
  },
  
  error: (message, error, ...args) => {
    console.error(`[ERROR] ${message}`, error, ...args);
    // In production, send to error tracking service (e.g., Sentry)
  },
  
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
    // In production, send to monitoring service
  },
  
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }
};
