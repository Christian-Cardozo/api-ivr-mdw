import { Module } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { MulesoftController } from './mulesoft.controller';

@Module({
  controllers: [MulesoftController],
  providers: [MulesoftService],
})
export class MulesoftModule {}
