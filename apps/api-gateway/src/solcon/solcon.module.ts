import { Module } from '@nestjs/common';
import { SolconService } from './solcon.service';
import { SolconController } from './solcon.controller';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [ResilienceModule],
  controllers: [SolconController],
  providers: [SolconService],
})
export class SolconModule {}
