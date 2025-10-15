import { Controller, Get } from '@nestjs/common';
import { RedisOptions, TcpClientOptions, Transport } from '@nestjs/microservices';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  MicroserviceHealthIndicator
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {

  constructor(
    private healthService: HealthCheckService,
    private msHealth: MicroserviceHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) { }

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {

    return this.healthService.check([
      async () =>
        this.msHealth.pingCheck<TcpClientOptions>('mulesoft-customer-ms', {
          transport: Transport.TCP,
          //options: { host: 'mulesoft-customer-ms', port: 3001 },
          options: { host: 'localhost', port: 3001 },
        }),
      async () =>
        this.msHealth.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            host: 'localhost',
            port: 6379,
          },
        }),
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
    ])
  }
}
