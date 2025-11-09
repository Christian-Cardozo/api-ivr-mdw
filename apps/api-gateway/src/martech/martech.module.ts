import { Module } from '@nestjs/common';
import { MartechService } from './martech.service';
import { MartechController } from './martech.controller';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [ResilienceModule],
  controllers: [MartechController],
  providers: [MartechService],
})
export class MartechModule {}
