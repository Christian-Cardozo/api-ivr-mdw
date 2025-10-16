import { Module, Global, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';
import { GlobalConfigModule } from '@app/config';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [GlobalConfigModule],
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const Redis = require('ioredis');
        const logger = new Logger('RedisModule');
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);

        const client = new Redis({
          host,
          port,
          maxRetriesPerRequest: 3,
          retryStrategy: (times: number) => Math.min(times * 50, 2000),
        });

        client.on('connect', () => {
          logger.log(`Connected to Redis at ${host}:${port}`);
        });

        client.on('reconnecting', () => {
          logger.warn('Reconnecting to Redis...');
        });

        client.on('end', () => {
          logger.warn('Redis connection closed.');
        });

        client.on('error', (err: Error) => {
          logger.error(`Redis connection error: ${err.message}`);
        });

        return client;
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule { }