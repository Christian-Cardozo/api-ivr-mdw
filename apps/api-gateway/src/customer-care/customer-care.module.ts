import { Module } from '@nestjs/common';
import { CustomerCareService } from './customer-care.service';
import { CustomerCareController } from './customer-care.controller';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [ResilienceModule],
  controllers: [CustomerCareController],
  providers: [CustomerCareService],
})
export class CustomerCareModule {}
