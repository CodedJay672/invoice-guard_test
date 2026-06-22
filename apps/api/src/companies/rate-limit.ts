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
    private readonly redis: RedisRateLimitClient,
    private readonly limit: number = anonymousSearchLimit,
    private readonly windowSeconds: number = anonymousSearchWindowSeconds,
  ) {}

  async check(ipHash: string): Promise<RateLimitResult> {
    const key = `invoiceguard:anonymous-search:${ipHash}`;
    const result = await this.redis.eval(atomicIncrementScript, 1, key, String(this.windowSeconds));
    const [count, ttl] = parseAtomicIncrementResult(result);
    const resetAtMs = Date.now() + Math.max(ttl, 0) * 1000;

    return {
      allowed: count <= this.limit,
      remaining: Math.max(this.limit - count, 0),
      resetAt: new Date(resetAtMs).toISOString(),
    };
  }
}

export interface RedisRateLimitClient {
  eval(script: string, numberOfKeys: number, ...args: string[]): Promise<unknown>;
}

const atomicIncrementScript = `
local count = redis.call("INCR", KEYS[1])
if count == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
return { count, ttl }
`;

function parseAtomicIncrementResult(result: unknown): [number, number] {
  if (
    !Array.isArray(result) ||
    result.length !== 2 ||
    typeof result[0] !== "number" ||
    typeof result[1] !== "number"
  ) {
    throw new Error("Redis returned an invalid anonymous-search rate-limit result.");
  }

  return [result[0], result[1]];
}
