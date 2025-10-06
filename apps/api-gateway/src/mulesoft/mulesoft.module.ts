import { Module } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { MulesoftController } from './mulesoft.controller';
import { AuthClientModule } from '@app/auth-client';

@Module({
  imports: [AuthClientModule],
  controllers: [MulesoftController],
  providers: [MulesoftService],
})
export class MulesoftModule {}
