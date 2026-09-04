export class BusinessSearchService {
  constructor(
    businessRepo,
    placesService,
    scraperService,
    cmsService,
    cacheService,
    historyService
  ) {
    this.businessRepo = businessRepo;
    this.placesService = placesService;
    this.scraperService = scraperService;
    this.cmsService = cmsService;
    this.cacheService = cacheService;
    this.historyService = historyService;
  }

  /**
   * Search, scrape, detect technology, cache, and save business leads
   */
  async search(
    niche,
    region,
    platformFilter = "Any Platform",
    count = 10,
    userId = null,
    onProgress
  ) {
    console.log(`[LeadFinder] Search query received: niche="${niche}", region="${region}", platformFilter="${platformFilter}", count=${count}`);
    
    const cacheKey = this.cacheService.generateKey(niche, region, platformFilter);
    onProgress?.(10, "Checking local database cache...");
    
    const cachedData = await this.cacheService.get(cacheKey);
    if (cachedData && cachedData.length > 0) {
      console.log(`[LeadFinder] Cache hit: found ${cachedData.length} cached leads`);
      onProgress?.(100, "Cache hit! Retrieved businesses from database.");
      await this.historyService.log(userId, niche, region, platformFilter, count, cachedData.length);
      return cachedData;
    }

    onProgress?.(30, `Querying external mapping networks for ${niche} in ${region}...`);
    const searchLimit = platformFilter !== "Any Platform" && platformFilter !== "Custom CMS" ? count * 3 : count;
    console.log(`[LeadFinder] Discovering businesses using placesService (limit=${searchLimit})...`);
    
    let discovered = [];
    try {
      discovered = await this.placesService.search(niche, region, searchLimit);
      console.log(`[LeadFinder] placesService.search returned ${discovered.length} businesses`);
    } catch (err) {
      console.error(`[LeadFinder] placesService.search threw an error:`, err.message || err);
    }

    if (discovered.length === 0) {
      console.log(`[LeadFinder] 0 businesses discovered by placesService, exiting search`);
      onProgress?.(100, "No businesses found for your search criteria.");
      await this.historyService.log(userId, niche, region, platformFilter, count, 0);
      return [];
    }

    onProgress?.(50, `Found ${discovered.length} businesses. Initializing technology crawl...`);
    const results = [];
    let processedCount = 0;

    for (const biz of discovered) {
      processedCount++;
      const currentProgress = 50 + Math.floor((processedCount / discovered.length) * 40);
      
      onProgress?.(
        currentProgress,
        `Crawl progress (${processedCount}/${discovered.length}): Scanning ${biz.name}...`
      );

      if (biz.website) {
        try {
          console.log(`[LeadFinder] Crawling and detecting technology for website: ${biz.website}`);
          const scraped = await this.scraperService.scrape(biz.website);
          const techResult = this.cmsService.detect(scraped.html, scraped.headers);
          
          biz.cms = techResult.cms;
          biz.detectedTechnologies = techResult.technologies;
          biz.socialLinks = scraped.socialLinks;
          
          console.log(`[LeadFinder] Detected CMS: ${biz.cms}, Techs count: ${biz.detectedTechnologies.length}`);

          if (scraped.contacts && scraped.contacts.length > 0) {
            biz.contacts = scraped.contacts;
          }

          if (biz.phone && !biz.contacts.some((c) => c.type === "phone")) {
            biz.contacts.push({ type: "phone", value: biz.phone, source: "places" });
          }
        } catch (crawlErr) {
          console.error(`[LeadFinder] Failed crawling ${biz.website}:`, crawlErr.message || crawlErr);
        }
      }

      const isPlatformMatch =
        platformFilter === "Any Platform" ||
        (biz.cms && biz.cms.toLowerCase() === platformFilter.toLowerCase());

      try {
        console.log(`[LeadFinder] Saving business lead to database: ${biz.name}`);
        const savedBusiness = await this.businessRepo.saveEnrichedBusiness(biz);
        if (isPlatformMatch && results.length < count) {
          results.push(savedBusiness);
        }
      } catch (dbErr) {
        console.error(`[LeadFinder] Failed saving business ${biz.name} to DB:`, dbErr);
      }
    }

    onProgress?.(95, "Caching crawled results and finishing up...");
    
    if (results.length > 0) {
      console.log(`[LeadFinder] Saving search results (count=${results.length}) to cache`);
      await this.cacheService.set(cacheKey, results, 24);
    }

    await this.historyService.log(userId, niche, region, platformFilter, count, results.length);

    console.log(`[LeadFinder] Search completed. Returning ${results.length} leads.`);
    onProgress?.(100, `Completed! Discovered ${results.length} matching leads.`);
    return results;
  }
}
