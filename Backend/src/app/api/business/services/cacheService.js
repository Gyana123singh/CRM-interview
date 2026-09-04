export class CacheService {
  constructor(businessRepo) {
    this.businessRepo = businessRepo;
  }

  generateKey(niche, region, platform) {
    const cleanNiche = niche.trim().toLowerCase().replace(/\s+/g, "_");
    const cleanRegion = region.trim().toLowerCase().replace(/\s+/g, "_");
    const cleanPlatform = platform.trim().toLowerCase().replace(/\s+/g, "_");
    return `search:${cleanNiche}:${cleanRegion}:${cleanPlatform}`;
  }

  async get(key) {
    try {
      return await this.businessRepo.findCachedSearch(key);
    } catch (err) {
      console.error(`Failed to retrieve cache for key ${key}:`, err);
      return null;
    }
  }

  async set(key, data, ttlHours = 24) {
    try {
      await this.businessRepo.saveSearchCache(key, data, ttlHours);
    } catch (err) {
      console.error(`Failed to set cache for key ${key}:`, err);
    }
  }

  async purge() {
    try {
      await this.businessRepo.clearAllCache();
    } catch (err) {
      console.error("Failed to purge search cache:", err);
    }
  }
}
