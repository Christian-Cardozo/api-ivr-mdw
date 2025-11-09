import { Module } from '@nestjs/common';
import { AmazonService } from './amazon.service';
import { AmazonController } from './amazon.controller';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [ResilienceModule],
  controllers: [AmazonController],
  providers: [AmazonService],
})
export class AmazonModule {}
