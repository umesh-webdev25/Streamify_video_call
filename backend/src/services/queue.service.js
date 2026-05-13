import { Queue } from "bullmq";
import Logger from "../utils/logger.js";

const connection = {
  url: process.env.REDIS_URL,
};

class QueueService {
  constructor() {
    this.queues = {};
    
    if (process.env.REDIS_URL) {
      this.initQueue("email");
      this.initQueue("notifications");
      this.initQueue("stream-sync");
    } else {
      Logger.warn("REDIS_URL not found. Background jobs will run synchronously (fallback).");
    }
  }

  initQueue(name) {
    this.queues[name] = new Queue(name, { connection });
    Logger.info(`Queue initialized: ${name}`);
  }

  async addJob(queueName, jobName, data, options = {}) {
    if (this.queues[queueName]) {
      return await this.queues[queueName].add(jobName, data, {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000,
        },
        ...options,
      });
    } else {
      // Fallback to synchronous execution for development without Redis
      Logger.debug(`Running job ${jobName} synchronously (no Redis)`);
      return null; 
    }
  }
}

export default new QueueService();
