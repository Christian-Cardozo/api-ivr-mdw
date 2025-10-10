import { Module, Global } from '@nestjs/common';
import { ResilienceService } from './resilience.service';

@Global()
@Module({
  providers: [ResilienceService],
  exports: [ResilienceService],
})
export class ResilienceModule {}