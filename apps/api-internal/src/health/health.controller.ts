import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {

  constructor(
    private healthService: HealthCheckService,
    private memory: MemoryHealthIndicator,  
    private db: TypeOrmHealthIndicator,
    private dataSource: DataSource,  
  ) { }

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {

    return this.healthService.check([
      async () => this.db.pingCheck('db', { connection: this.dataSource }),
      async () => this.memory.checkHeap('memory_heap', 200 * 1024 * 1024),
      async () => this.memory.checkRSS('memory_rss', 3000 * 1024 * 1024),
      async () => {
        const required = ['DB_HOST','DB_PORT','DB_USER','DB_PASS','DB_NAME'];
        const missing = required.filter(k => !process.env[k]);
        if (missing.length) throw new Error(`missing env: ${missing.join(',')}`);
        return { env: { status: 'up' } };
      },
    ])
  }
}
