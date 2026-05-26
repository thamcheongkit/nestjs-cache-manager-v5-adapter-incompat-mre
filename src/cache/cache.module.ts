import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { create as createRedisStore } from 'cache-manager-ioredis';

export type LegacyRedisStore = ReturnType<typeof createRedisStore>;

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: createRedisStore({
          ttl: 60_000,
          clusterConfig: {
            nodes: [
              {
                host: process.env.REDIS_HOST ?? 'localhost',
                port: Number(process.env.REDIS_PORT ?? 7001),
              },
            ],
          },
        }),
      }),
    }),
  ],
  exports: [CacheModule],
})
export class CacheManagerModule {}
