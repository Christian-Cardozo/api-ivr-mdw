import { Module } from '@nestjs/common';
import { ResilienceService } from './resilience.service';
import { CircuitBreakerModule } from './circuit-breaker/circuit-breaker.module';

@Module({
  imports: [CircuitBreakerModule],
  providers: [ResilienceService],
  exports: [ResilienceService],
})
export class ResilienceModule {}
