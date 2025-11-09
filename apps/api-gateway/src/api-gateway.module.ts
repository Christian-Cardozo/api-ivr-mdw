import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { MulesoftModule } from './mulesoft/mulesoft.module';
import { HealthModule } from './health/health.module';
import { XscaleModule } from './xscale/xscale.module';
import { CustomerCareModule } from './customer-care/customer-care.module';

@Module({
  imports: [MulesoftModule, HealthModule, XscaleModule, CustomerCareModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule { }
