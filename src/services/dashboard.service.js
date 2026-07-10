
import * as repository from "../repositories/dashboard.repository.js";
import redisClient from "../config/redis.js";

const clearAssignedTicketsCache = async () => {
  const keys = await redisClient.keys("dashboard:assigned:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }
};

export const getDashboard = async (user) => {
  const statsCacheKey = "dashboard:stats";
  const assignedCacheKey = `dashboard:assigned:${user.id}`;

  // Check Redis first
  const [cachedStats, cachedAssigned] = await Promise.all([
    redisClient.get(statsCacheKey),
    redisClient.get(assignedCacheKey),
  ]);

  if (cachedStats && cachedAssigned) {
    console.log("⚡ Dashboard served from Redis");
    return {
      ...JSON.parse(cachedStats),
      assignedTickets: JSON.parse(cachedAssigned),
    };
  }

  // Fetch from MySQL
  const [dashboard, assignedTickets] = await Promise.all([
    cachedStats ? JSON.parse(cachedStats) : repository.getDashboardStats(),
    cachedAssigned ? JSON.parse(cachedAssigned) : repository.getAssignedTickets(user.id),
  ]);

  // Cache for 60 seconds
  await Promise.all([
    cachedStats
      ? Promise.resolve()
      : redisClient.setEx(statsCacheKey, 60, JSON.stringify(dashboard)),
    cachedAssigned
      ? Promise.resolve()
      : redisClient.setEx(
          assignedCacheKey,
          60,
          JSON.stringify(assignedTickets),
        ),
  ]);

  console.log("💾 Dashboard cached in Redis");

  return {
    ...dashboard,
    assignedTickets,
  };
};

export const invalidateDashboardCache = async () => {
  await redisClient.del("dashboard:stats");
  await clearAssignedTicketsCache();
};
