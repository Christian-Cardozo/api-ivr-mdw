import { Module } from '@nestjs/common';
import { MulesoftCustomerMsController } from './mulesoft-customer-ms.controller';
import { MulesoftCustomerMsService } from './mulesoft-customer-ms.service';

@Module({
  imports: [],
  controllers: [MulesoftCustomerMsController],
  providers: [MulesoftCustomerMsService],
})
export class MulesoftCustomerMsModule {}
