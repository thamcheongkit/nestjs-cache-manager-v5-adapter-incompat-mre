import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import type { LegacyRedisStore } from './cache/cache.module';

const EXAMPLE_CACHE_KEY = 'demo:ttl-example';
const DEFAULT_TTL_CACHE_KEY = 'demo:default-ttl-example';
/** cache-manager v5 expects TTL in milliseconds */
const EXAMPLE_TTL_MS = 120_000;
/** Matches global ttl configured in CacheManagerModule */
const GLOBAL_DEFAULT_TTL_MS = 60_000;
const PTTL_CHECK_DELAY_MS = 3_000;

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  private getRedis() {
    return (this.cache.store as LegacyRedisStore).getClient();
  }

  private async readPttlAfterDelay(key: string) {
    const redis = this.getRedis();
    const pttlMs = await redis.pttl(key);

    await new Promise((resolve) => setTimeout(resolve, PTTL_CHECK_DELAY_MS));

    const pttlMsAfter3s = await redis.pttl(key);
    this.logger.log(
      `PTTL after ${PTTL_CHECK_DELAY_MS}ms for key=${key}: ${pttlMsAfter3s}`,
    );

    return { pttlMs, pttlMsAfter3s };
  }

  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Sets a key via cache-manager (Redis store), then reads value + TTL using the
   * underlying ioredis client from `cache-manager-ioredis` (`getClient()`).
   */
  async runCacheTtlExample() {
    const value = { message: 'hello from cache', at: new Date().toISOString() };

    await this.cache.set(EXAMPLE_CACHE_KEY, value, EXAMPLE_TTL_MS);

    const fromCacheManager = await this.cache.get<typeof value>(
      EXAMPLE_CACHE_KEY,
    );

    const redis = this.getRedis();
    const rawFromRedis = await redis.get(EXAMPLE_CACHE_KEY);
    const { pttlMs, pttlMsAfter3s } = await this.readPttlAfterDelay(
      EXAMPLE_CACHE_KEY,
    );

    return {
      key: EXAMPLE_CACHE_KEY,
      ttlSetMs: EXAMPLE_TTL_MS,
      valueFromCacheManager: fromCacheManager,
      rawValueFromIoredisGet: rawFromRedis,
      pttlMsFromIoredis: pttlMs,
      pttlMsFromIoredisAfter3s: pttlMsAfter3s,
    };
  }

  /**
   * Sets a key without passing TTL — cache-manager uses the global default from
   * CacheModule registration (`ttl` in cache.module.ts).
   */
  async runCacheDefaultTtlExample() {
    const value = {
      message: 'hello with global default ttl',
      at: new Date().toISOString(),
    };

    await this.cache.set(DEFAULT_TTL_CACHE_KEY, value);

    const fromCacheManager = await this.cache.get<typeof value>(
      DEFAULT_TTL_CACHE_KEY,
    );

    const redis = this.getRedis();
    const rawFromRedis = await redis.get(DEFAULT_TTL_CACHE_KEY);
    const { pttlMs, pttlMsAfter3s } = await this.readPttlAfterDelay(
      DEFAULT_TTL_CACHE_KEY,
    );

    return {
      key: DEFAULT_TTL_CACHE_KEY,
      globalDefaultTtlMs: GLOBAL_DEFAULT_TTL_MS,
      valueFromCacheManager: fromCacheManager,
      rawValueFromIoredisGet: rawFromRedis,
      pttlMsFromIoredis: pttlMs,
      pttlMsFromIoredisAfter3s: pttlMsAfter3s,
    };
  }
}
