import { BusinessRepository } from "../repositories/businessRepository.js";
import { GooglePlacesService } from "../services/googlePlacesService.js";
import { WebsiteScraperService } from "../services/websiteScraperService.js";
import { CmsDetectionService } from "../services/cmsDetectionService.js";
import { CacheService } from "../services/cacheService.js";
import { SearchHistoryService } from "../services/searchHistoryService.js";
import { BusinessSearchService } from "../services/businessSearchService.js";
import { searchSchema, saveLeadSchema } from "../validators/searchValidator.js";
import { logger } from "../middlewares/errorHandler.js";

export class BusinessController {
  constructor(
    searchService,
    businessRepo,
    cacheService,
    historyService
  ) {
    this.searchService = searchService;
    this.businessRepo = businessRepo;
    this.cacheService = cacheService;
    this.historyService = historyService;
  }

  /**
   * POST /api/business/search
   */
  search = async (req, res, next) => {
    const startTime = Date.now();
    try {
      const validated = searchSchema.parse(req.body);
      const userId = req.user?.id || null;

      logger.info(
        `Starting business search: Niche="${validated.niche}", Region="${validated.region}", Platform="${validated.platformFilter}", Limit=${validated.count}`
      );

      const results = await this.searchService.search(
        validated.niche,
        validated.region,
        validated.platformFilter,
        validated.count,
        userId
      );

      await this.businessRepo.logApi({
        endpoint: "/api/business/search",
        method: "POST",
        requestBody: JSON.stringify(req.body),
        statusCode: 200,
        duration: Date.now() - startTime,
        ip: req.ip || "127.0.0.1",
        userId: userId || undefined,
      });

      return res.status(200).json(results);
    } catch (err) {
      await this.businessRepo.logApi({
        endpoint: "/api/business/search",
        method: "POST",
        requestBody: JSON.stringify(req.body),
        responseBody: err.message || JSON.stringify(err),
        statusCode: err.status || 500,
        duration: Date.now() - startTime,
        ip: req.ip || "127.0.0.1",
        userId: req.user?.id || undefined,
      });
      next(err);
    }
  };

  /**
   * GET /api/business/:id
   */
  getById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const business = await this.businessRepo.getBusinessById(id);

      if (!business) {
        return res.status(404).json({ error: "Business lead not found" });
      }

      return res.status(200).json(business);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/business/history
   */
  getHistory = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const history = await this.historyService.getHistory(userId);
      return res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  };

  /**
   * GET /api/business/saved
   */
  getSaved = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const savedLeads = await this.businessRepo.getSavedLeads(userId);
      return res.status(200).json(savedLeads);
    } catch (err) {
      next(err);
    }
  };

  /**
   * POST /api/business/save
   */
  saveLead = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validated = saveLeadSchema.parse(req.body);
      const saved = await this.businessRepo.saveLead(
        userId,
        validated.businessId,
        validated.notes,
        validated.leadListId
      );

      return res.status(201).json({
        message: "Business lead saved successfully",
        savedLead: saved,
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/business/save/:id
   */
  unsaveLead = async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const { id } = req.params;
      await this.businessRepo.unsaveLead(userId, id);

      return res.status(200).json({
        message: "Business lead unsaved successfully",
      });
    } catch (err) {
      next(err);
    }
  };

  /**
   * DELETE /api/business/cache
   */
  clearCache = async (req, res, next) => {
    try {
      await this.cacheService.purge();
      return res.status(200).json({ message: "Search cache cleared successfully" });
    } catch (err) {
      next(err);
    }
  };
}

const businessRepo = new BusinessRepository();
const placesService = new GooglePlacesService();
const scraperService = new WebsiteScraperService();
const cmsService = new CmsDetectionService();
const cacheService = new CacheService(businessRepo);
const historyService = new SearchHistoryService(businessRepo);

export const businessSearchService = new BusinessSearchService(
  businessRepo,
  placesService,
  scraperService,
  cmsService,
  cacheService,
  historyService
);

export const businessController = new BusinessController(
  businessSearchService,
  businessRepo,
  cacheService,
  historyService
);
