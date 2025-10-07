import { Module } from '@nestjs/common';
import { AuthClientService } from './auth-client.service';
import { RedisModule } from '@app/redis';

@Module({
  imports: [RedisModule],
  providers: [AuthClientService],
  exports: [AuthClientService],
})
export class AuthClientModule {}
