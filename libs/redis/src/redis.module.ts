import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { GlobalConfigModule } from '@app/config';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [    
    CacheModule.registerAsync({
      imports: [GlobalConfigModule], // necesario para inyectar ConfigService
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const host = config.get<string>('REDIS_HOST') || 'localhost';
        const port = config.get<number>('REDIS_PORT') || 6379;
        const password = config.get<string>('REDIS_PASSWORD') || '';

        const uri = password
          ? `redis://:${password}@${host}:${port}`
          : `redis://${host}:${port}`;

        return {
          stores: [new KeyvRedis(uri)],
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule { }
