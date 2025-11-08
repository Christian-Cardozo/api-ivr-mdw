import { Module } from '@nestjs/common';
import { XscaleService } from './xscale.service';
import { XscaleController } from './xscale.controller';
import { ResilienceModule } from '@app/resilience';
import { AuthClientModule } from '@app/auth-client';

@Module({
  imports: [ResilienceModule, AuthClientModule],
  controllers: [XscaleController],
  providers: [XscaleService],
})
export class XscaleModule {}
