import { Module } from '@nestjs/common';
import { MulesoftCustomerMsController } from './mulesoft-customer-ms.controller';
import { MulesoftCustomerMsService } from './mulesoft-customer-ms.service';
import { AuthClientModule } from '@app/auth-client';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [AuthClientModule, ResilienceModule],
  controllers: [MulesoftCustomerMsController],
  providers: [MulesoftCustomerMsService],
})
export class MulesoftCustomerMsModule {}