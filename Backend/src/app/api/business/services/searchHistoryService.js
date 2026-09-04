export class SearchHistoryService {
  constructor(businessRepo) {
    this.businessRepo = businessRepo;
  }

  async log(
    userId,
    niche,
    region,
    platform,
    limit,
    resultsCount
  ) {
    try {
      await this.businessRepo.logSearchHistory(
        userId,
        niche,
        region,
        platform || "Any Platform",
        limit,
        resultsCount
      );
    } catch (err) {
      console.error("Failed to log search history:", err);
    }
  }

  async getHistory(userId) {
    try {
      return await this.businessRepo.getSearchHistory(userId);
    } catch (err) {
      console.error(`Failed to fetch history for user ${userId}:`, err);
      return [];
    }
  }
}
