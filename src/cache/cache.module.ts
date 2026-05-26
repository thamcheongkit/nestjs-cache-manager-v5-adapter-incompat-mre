import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
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
