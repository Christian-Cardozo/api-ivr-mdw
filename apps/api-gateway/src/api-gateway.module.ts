import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { MulesoftModule } from './mulesoft/mulesoft.module';
import { HealthModule } from './health/health.module';
import { XscaleModule } from './xscale/xscale.module';
import { CustomerCareModule } from './customer-care/customer-care.module';
import { IceModule } from './ice/ice.module';
import { MartechModule } from './martech/martech.module';
import { SalesforceModule } from './salesforce/salesforce.module';
import { QualtricsModule } from './qualtrics/qualtrics.module';
import { SalesforceModule } from './salesforce/salesforce.module';

@Module({
  imports: [MulesoftModule, HealthModule, XscaleModule, CustomerCareModule, IceModule, MartechModule, SalesforceModule, QualtricsModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule { }
