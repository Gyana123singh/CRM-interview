import { Router } from "express";
import { authenticateJWT } from "../../../../middleware/auth.js";
import { businessController } from "../controllers/businessController.js";
import { searchRateLimiter, generalRateLimiter } from "../middlewares/rateLimiter.js";
import { errorHandler } from "../middlewares/errorHandler.js";

const router = Router();

// ==========================================
// BUSINESS LEAD FINDER ROUTE REGISTRY
// ==========================================

router.post(
  "/search",
  generalRateLimiter,
  authenticateJWT,
  businessController.search
);

router.get(
  "/history",
  generalRateLimiter,
  authenticateJWT,
  businessController.getHistory
);

router.get(
  "/saved",
  generalRateLimiter,
  authenticateJWT,
  businessController.getSaved
);

router.post(
  "/save",
  generalRateLimiter,
  authenticateJWT,
  businessController.saveLead
);

router.delete(
  "/save/:id",
  generalRateLimiter,
  authenticateJWT,
  businessController.unsaveLead
);

router.delete(
  "/cache",
  generalRateLimiter,
  authenticateJWT,
  businessController.clearCache
);

router.get(
  "/:id",
  generalRateLimiter,
  authenticateJWT,
  businessController.getById
);

router.use(errorHandler);

export default router;
