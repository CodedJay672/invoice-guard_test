import { Redis } from "ioredis";
import type { RedisOptions } from "ioredis";

export interface QueueConnectionOptions {
  connectionString: string;
  redisOptions?: RedisOptions;
}

export type QueueRedisConnection = Redis;

export function getQueueConnectionString(
  env: Record<string, string | undefined> = process.env,
): string {
  const connectionString = env["REDIS_URL"];

  if (!connectionString) {
    throw new Error("REDIS_URL is required to create a BullMQ Redis connection.");
  }

  return connectionString;
}

export function createQueueConnection(options: QueueConnectionOptions): QueueRedisConnection {
  if (!options.connectionString) {
    throw new Error("A Redis connection string is required.");
  }

  return new Redis(options.connectionString, {
    maxRetriesPerRequest: null,
    ...options.redisOptions,
  });
}
