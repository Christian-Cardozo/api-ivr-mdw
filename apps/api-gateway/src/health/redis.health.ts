import { Injectable } from '@nestjs/common';
import { HealthIndicatorService, HealthIndicatorResult } from '@nestjs/terminus';
import { RedisService } from '@app/redis';

@Injectable()
export class RedisIoHealth {
  constructor(
    private readonly redis: RedisService,
    private readonly his: HealthIndicatorService,
  ) {}

  async isHealthy(key = 'redis'): Promise<HealthIndicatorResult> {
    const indicator = this.his.check(key);
    try {
      const pong = await this.redis.getRedisClient().ping();
      return pong === 'PONG' ? indicator.up() : indicator.down({ error: 'PING failed' });
    } catch (e) {
      return indicator.down({ error: String(e) });
    }
  }
}
