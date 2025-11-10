import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { MulesoftModule } from './mulesoft/mulesoft.module';
import { HealthModule } from './health/health.module';
import { XscaleModule } from './xscale/xscale.module';
import { CustomerCareModule } from './customer-care/customer-care.module';
import { IceModule } from './ice/ice.module';
import { MartechModule } from './martech/martech.module';
import { OssModule } from './oss/oss.module';
import { ResponsysModule } from './responsys/responsys.module';
import { AmazonModule } from './amazon/amazon.module';
import { SolconModule } from './solcon/solcon.module';
import { QualtricsModule } from './qualtrics/qualtrics.module';
import { SalesforceModule } from './salesforce/salesforce.module';

@Module({
  imports: [MulesoftModule, HealthModule, XscaleModule, CustomerCareModule, IceModule, MartechModule, SalesforceModule, QualtricsModule, SolconModule, AmazonModule, ResponsysModule, OssModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule { }
