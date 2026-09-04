import rateLimit from "express-rate-limit";

export const searchRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    error: "Too many search requests. Please wait 15 minutes before searching again.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests. Please throttle your usage.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
