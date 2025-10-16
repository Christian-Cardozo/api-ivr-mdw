import { Module } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { RedisIoHealth } from './redis.health';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthService, RedisIoHealth],
})
export class HealthModule {}
