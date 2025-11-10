import { Module } from '@nestjs/common';
import { MulesoftDigitalBillingMsController } from './mulesoft-digital-billing-ms.controller';
import { MulesoftDigitalBillingMsService } from './mulesoft-digital-billing-ms.service';
import { AuthClientModule } from '@app/auth-client';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [AuthClientModule, ResilienceModule],
  controllers: [MulesoftDigitalBillingMsController],
  providers: [MulesoftDigitalBillingMsService],
})
export class MulesoftDigitalBillingMsModule {}
