import { Module } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { RedisModule } from '@app/redis';
import { GlobalConfigModule } from '@app/config';

@Module({
  imports: [RedisModule, GlobalConfigModule],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class AuthClientModule {}
