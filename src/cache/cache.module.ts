import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        ttl: 60_000,
        store: await redisStore({
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
