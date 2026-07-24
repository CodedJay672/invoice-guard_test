import type { FreeCompanyTabPayload } from "@workspace/types";

export interface CompanyTabCache {
  get(key: string): Promise<FreeCompanyTabPayload | undefined>;
  set(key: string, value: FreeCompanyTabPayload, ttlSeconds: number): Promise<void>;
}

export class InMemoryCompanyTabCache implements CompanyTabCache {
  private readonly values = new Map<string, { value: FreeCompanyTabPayload; expiresAt: number }>();

  get(key: string): Promise<FreeCompanyTabPayload | undefined> {
    const entry = this.values.get(key);
    if (!entry || entry.expiresAt <= Date.now()) {
      this.values.delete(key);
      return Promise.resolve(undefined);
    }
    return Promise.resolve(entry.value);
  }

  set(key: string, value: FreeCompanyTabPayload, ttlSeconds: number): Promise<void> {
    this.values.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
    return Promise.resolve();
  }
}

export interface RedisCompanyTabCacheClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: "EX", ttlSeconds: number): Promise<unknown>;
}

export class RedisCompanyTabCache implements CompanyTabCache {
  constructor(private readonly redis: RedisCompanyTabCacheClient) {}

  async get(key: string): Promise<FreeCompanyTabPayload | undefined> {
    const value = await this.redis.get(key);
    return value ? (JSON.parse(value) as FreeCompanyTabPayload) : undefined;
  }

  async set(key: string, value: FreeCompanyTabPayload, ttlSeconds: number): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }
}
