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


@Controller('health')
export class HealthController {

  constructor(
    private healthService: HealthCheckService,
    private msHealth: MicroserviceHealthIndicator,
    private memory: MemoryHealthIndicator,
    private configService:ConfigService,
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
            port: this.configService.get<number>('MULESOFT_CUSTOMER_MS_PORT') || 3001 , 
          },          
        }),
      async () =>
        this.msHealth.pingCheck<RedisOptions>('redis', {
          transport: Transport.REDIS,
          options: {
            host: this.configService.get<string>('REDIS_HOST') || 'localhost',            
            port: this.configService.get<number>('REDIS_PORT') || 6379,
          },
        }),
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
    ])
  }
}
