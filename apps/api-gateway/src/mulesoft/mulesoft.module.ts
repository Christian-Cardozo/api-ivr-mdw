import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { GlobalConfigModule } from '@app/config';
import { AuthClientModule } from '@app/auth-client';

import { MulesoftController } from './mulesoft.controller';
import { MulesoftService } from './mulesoft.service';

@Module({
  imports: [
    AuthClientModule,
    ClientsModule.registerAsync([
      {
        name: 'MULESOFT_CUSTOMER_MS',
        imports: [GlobalConfigModule],        // <- necesario para el factory
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('MULESOFT_CUSTOMER_MS_HOST', 'localhost'),
            port: config.get<number>('MULESOFT_CUSTOMER_MS_PORT', 3001),
          },
        }),
      },
    ]),
  ],
  controllers: [MulesoftController],
  providers: [MulesoftService],
})
export class MulesoftModule {}
