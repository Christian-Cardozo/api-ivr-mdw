import { Module } from '@nestjs/common';
import { CustomerCareService } from './customer-care.service';
import { CustomerCareController } from './customer-care.controller';

@Module({
  controllers: [CustomerCareController],
  providers: [CustomerCareService],
})
export class CustomerCareModule {}
