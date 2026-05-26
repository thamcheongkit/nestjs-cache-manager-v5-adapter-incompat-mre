import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT ?? 3000);

  const result = await app.get(AppService).runCacheTtlExample();
  Logger.log(
    `Cache TTL example: key=${result.key} pttlMs=${result.pttlMsFromIoredis} pttlMsAfter3s=${result.pttlMsFromIoredisAfter3s}`,
    'Bootstrap',
  );

  const defaultTtlResult = await app
    .get(AppService)
    .runCacheDefaultTtlExample();
  Logger.log(
    `Cache default TTL example: key=${defaultTtlResult.key} globalDefaultTtlMs=${defaultTtlResult.globalDefaultTtlMs} pttlMs=${defaultTtlResult.pttlMsFromIoredis} pttlMsAfter3s=${defaultTtlResult.pttlMsFromIoredisAfter3s}`,
    'Bootstrap',
  );

  app.close();
}
bootstrap();
