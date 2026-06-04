import { Redis } from "ioredis";

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: string;
}

export interface AnonymousSearchRateLimiter {
  check(ipHash: string): Promise<RateLimitResult>;
}

export const anonymousSearchLimit = 5;
export const anonymousSearchWindowSeconds = 24 * 60 * 60;

interface RateLimitBucket {
  count: number;
  resetAtMs: number;
}

export class InMemoryAnonymousSearchRateLimiter implements AnonymousSearchRateLimiter {
  private readonly buckets = new Map<string, RateLimitBucket>();

  constructor(
    private readonly limit: number = anonymousSearchLimit,
    private readonly windowSeconds: number = anonymousSearchWindowSeconds,
  ) {}

  check(ipHash: string): Promise<RateLimitResult> {
    const now = Date.now();
    const existingBucket = this.buckets.get(ipHash);
    const bucket =
      existingBucket && existingBucket.resetAtMs > now
        ? existingBucket
        : { count: 0, resetAtMs: now + this.windowSeconds * 1000 };

    bucket.count += 1;
    this.buckets.set(ipHash, bucket);

    const remaining = Math.max(this.limit - bucket.count, 0);

    return Promise.resolve({
      allowed: bucket.count <= this.limit,
      remaining,
      resetAt: new Date(bucket.resetAtMs).toISOString(),
    });
  }
}

export class RedisAnonymousSearchRateLimiter implements AnonymousSearchRateLimiter {
  constructor(
    private readonly redis: Redis,
    private readonly limit: number = anonymousSearchLimit,
    private readonly windowSeconds: number = anonymousSearchWindowSeconds,
  ) {}

  async check(ipHash: string): Promise<RateLimitResult> {
    const key = `invoiceguard:anonymous-search:${ipHash}`;
    const count = await this.redis.incr(key);

    if (count === 1) {
      await this.redis.expire(key, this.windowSeconds);
    }

    const ttl = await this.redis.ttl(key);
    const resetAtMs = Date.now() + Math.max(ttl, 0) * 1000;

    return {
      allowed: count <= this.limit,
      remaining: Math.max(this.limit - count, 0),
      resetAt: new Date(resetAtMs).toISOString(),
    };
  }
}
