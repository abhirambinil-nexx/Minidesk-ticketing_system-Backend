
import * as repository from "../repositories/dashboard.repository.js";
import redisClient from "../config/redis.js";

export const getDashboard = async () => {
  const cacheKey = "dashboard:stats";

  // Check Redis first
  const cachedData = await redisClient.get(cacheKey);

  if (cachedData) {
    console.log("⚡ Dashboard served from Redis");
    return JSON.parse(cachedData);
  }

  // Fetch from MySQL
  const dashboard = await repository.getDashboardStats();

  // Cache for 60 seconds
  await redisClient.setEx(cacheKey, 60, JSON.stringify(dashboard));

  console.log("💾 Dashboard cached in Redis");

  return dashboard;
};
