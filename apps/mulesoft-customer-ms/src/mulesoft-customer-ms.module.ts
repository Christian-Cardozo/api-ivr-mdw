import { Module } from '@nestjs/common';
import { MulesoftCustomerMsController } from './mulesoft-customer-ms.controller';
import { MulesoftCustomerMsService } from './mulesoft-customer-ms.service';
import { AuthClientModule } from '@app/auth-client';

@Module({
  imports: [AuthClientModule],
  controllers: [MulesoftCustomerMsController],
  providers: [MulesoftCustomerMsService],
})
export class MulesoftCustomerMsModule {}
