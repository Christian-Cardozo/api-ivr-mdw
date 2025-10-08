import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { MulesoftModule } from './mulesoft/mulesoft.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [MulesoftModule, HealthModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule { }
