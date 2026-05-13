import Redis from "ioredis";
import Logger from "../utils/logger.js";

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;

    if (process.env.REDIS_URL) {
      this.client = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        Logger.info("Redis connected 🚀");
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        Logger.error(`Redis Error: ${err.message}`);
      });
    } else {
      Logger.warn("REDIS_URL not found. Caching will be disabled.");
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      Logger.error(`Redis Get Error: ${error.message}`);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    if (!this.isConnected) return false;
    try {
      await this.client.set(key, JSON.stringify(value), "EX", ttl);
      return true;
    } catch (error) {
      Logger.error(`Redis Set Error: ${error.message}`);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      Logger.error(`Redis Del Error: ${error.message}`);
      return false;
    }
  }
}

export default new RedisService();
