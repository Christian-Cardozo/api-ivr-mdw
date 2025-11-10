import { Module } from '@nestjs/common';
import { QualtricsService } from './qualtrics.service';
import { QualtricsController } from './qualtrics.controller';

@Module({
  controllers: [QualtricsController],
  providers: [QualtricsService],
})
export class QualtricsModule {}
