import { Controller, Get } from '@nestjs/common';
import { RedisOptions, TcpClientOptions, Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { RedisIoHealth } from './redis.health';


@Controller('health')
export class HealthController {

  constructor(
    private healthService: HealthCheckService,
    private msHealth: MicroserviceHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService: ConfigService,
    private redisIoHealth: RedisIoHealth,
  ) { }

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {

    return this.healthService.check([
      async () =>
        this.msHealth.pingCheck<TcpClientOptions>('mulesoft-customer-ms', {
          transport: Transport.TCP,
          options: {
            host: this.configService.get<string>('MULESOFT_CUSTOMER_MS_HOST') || 'localhost',
            port: 3001,
          },
        }),
      async () =>
        this.msHealth.pingCheck<TcpClientOptions>('mulesoft-digital-billing-ms', {
          transport: Transport.TCP,
          options: {
            host: this.configService.get<string>('MULESOFT_DIGITAL_BILLING_MS_HOST') || 'localhost',
            port: 3002,
          },
        }),
      async () => this.redisIoHealth.isHealthy('redis'),
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
    ])
  }
}
