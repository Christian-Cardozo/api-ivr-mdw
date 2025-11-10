import { Module } from '@nestjs/common';
import { IceService } from './ice.service';
import { IceController } from './ice.controller';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [ResilienceModule],
  controllers: [IceController],
  providers: [IceService],
})
export class IceModule {}
