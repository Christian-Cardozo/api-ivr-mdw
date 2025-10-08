import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

@Controller('health')
export class HealthController {

  constructor(private hc: HealthCheckService) { }
  
  @Get()
  @HealthCheck()
  check() { return this.hc.check([]); } // luego podés sumar checks (redis, etc.)
}
