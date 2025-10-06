import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {        
        return {
          stores: [            
            new KeyvRedis('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class RedisModule { }
