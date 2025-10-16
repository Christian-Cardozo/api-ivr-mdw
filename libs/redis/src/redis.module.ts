import { Module, Global } from '@nestjs/common';
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
        const host = config.get<string>('REDIS_HOST', 'localhost');
        const port = config.get<number>('REDIS_PORT', 6379);        

        return new Redis({
          host,
          port,          
          maxRetriesPerRequest: 3,
          retryStrategy: (times:number) => Math.min(times * 50, 2000),
        });
      },
    },
    RedisService,
  ],
  exports: [RedisService],
})
export class RedisModule {}