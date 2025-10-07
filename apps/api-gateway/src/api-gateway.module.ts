import { Module } from '@nestjs/common';
import { ApiGatewayController } from './api-gateway.controller';
import { ApiGatewayService } from './api-gateway.service';
import { MulesoftModule } from './mulesoft/mulesoft.module';
import { GlobalConfigModule } from '@app/config';

@Module({
  imports: [MulesoftModule, GlobalConfigModule],
  controllers: [ApiGatewayController],
  providers: [ApiGatewayService],
})
export class ApiGatewayModule { }
