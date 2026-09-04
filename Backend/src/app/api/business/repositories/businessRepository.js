import { SearchCache, SearchHistory, Business, Technology, SavedLead, ApiLog } from "../../../../models/index.js";

export class BusinessRepository {
  async findCachedSearch(queryKey) {
    const cache = await SearchCache.findOne({ queryKey });

    if (!cache) return null;

    if (new Date() > new Date(cache.expiresAt)) {
      await SearchCache.deleteOne({ queryKey });
      return null;
    }

    return cache.results;
  }

  async saveSearchCache(queryKey, results, ttlHours = 24) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + ttlHours);

    return SearchCache.findOneAndUpdate(
      { queryKey },
      {
        queryKey,
        results,
        expiresAt,
        createdAt: new Date(),
      },
      { upsert: true, new: true }
    );
  }

  async clearAllCache() {
    return SearchCache.deleteMany({});
  }

  async logSearchHistory(
    userId,
    niche,
    region,
    platform,
    limit,
    resultsCount
  ) {
    return SearchHistory.create({
      niche,
      region,
      platform,
      limit,
      userId,
      resultsCount,
    });
  }

  async getSearchHistory(userId) {
    return SearchHistory.find({ userId }).sort({ createdAt: -1 });
  }

  async saveEnrichedBusiness(data) {
    let business;
    if (data.placeId) {
      business = await Business.findOneAndUpdate(
        { placeId: data.placeId },
        {
          placeId: data.placeId,
          name: data.name,
          website: data.website,
          phone: data.phone,
          address: data.address,
          rating: data.rating,
          latitude: data.coordinates?.lat,
          longitude: data.coordinates?.lng,
          cms: data.cms,
          contacts: data.contacts || [],
          socialLinks: data.socialLinks || {},
          detectedTechnologies: data.detectedTechnologies || []
        },
        { upsert: true, new: true }
      );
    } else {
      let query = {};
      if (data.website) query.website = data.website;
      else if (data.name) query.name = data.name;

      const existing = await Business.findOne(query);

      if (existing) {
        business = await Business.findByIdAndUpdate(
          existing._id,
          {
            phone: data.phone || existing.phone,
            address: data.address || existing.address,
            rating: data.rating || existing.rating,
            latitude: data.coordinates?.lat || existing.latitude,
            longitude: data.coordinates?.lng || existing.longitude,
            cms: data.cms || existing.cms,
            contacts: data.contacts || existing.contacts,
            socialLinks: data.socialLinks || existing.socialLinks,
            detectedTechnologies: data.detectedTechnologies || existing.detectedTechnologies
          },
          { new: true }
        );
      } else {
        business = await Business.create({
          name: data.name,
          website: data.website,
          phone: data.phone,
          address: data.address,
          rating: data.rating,
          latitude: data.coordinates?.lat,
          longitude: data.coordinates?.lng,
          cms: data.cms,
          contacts: data.contacts || [],
          socialLinks: data.socialLinks || {},
          detectedTechnologies: data.detectedTechnologies || []
        });
      }
    }

    return business;
  }

  async getBusinessById(id) {
    return Business.findById(id);
  }

  async saveLead(userId, businessId, notes, leadListId) {
    return SavedLead.findOneAndUpdate(
      { userId, businessId },
      { userId, businessId, notes, leadListId },
      { upsert: true, new: true }
    );
  }

  async unsaveLead(userId, businessId) {
    return SavedLead.deleteOne({ userId, businessId });
  }

  async getSavedLeads(userId) {
    return SavedLead.find({ userId }).populate("businessId").populate("leadListId");
  }

  async logApi(log) {
    return ApiLog.create(log);
  }
}
