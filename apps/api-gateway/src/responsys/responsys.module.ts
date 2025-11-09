import { Module } from '@nestjs/common';
import { ResponsysService } from './responsys.service';
import { ResponsysController } from './responsys.controller';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [ResilienceModule],
  controllers: [ResponsysController],
  providers: [ResponsysService],
})
export class ResponsysModule {}
