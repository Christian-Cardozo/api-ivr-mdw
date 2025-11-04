import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { GlobalConfigModule } from '@app/config';
import { AuthClientModule } from '@app/auth-client';

import { MulesoftController } from './mulesoft.controller';
import { MulesoftService } from './mulesoft.service';
import { ResilienceModule } from '@app/resilience';

@Module({
  imports: [
    AuthClientModule,
    ResilienceModule,
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
            retryAttempts: 10,
            retryDelay: 3000,
            timeout: 60000,
          },
        }),
        
      },
      {
        name: 'MULESOFT_DIGITAL_BILLING_MS',
        imports: [GlobalConfigModule],        // <- necesario para el factory
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('MULESOFT_DIGITAL_BILLING_MS_HOST', 'localhost'),
            port: config.get<number>('MULESOFT_DIGITAL_BILLING_MS_PORT', 3001),
            retryAttempts: 10,
            retryDelay: 3000,
            timeout: 60000,
          },
        }),
        
      },
    ]),
  ],
  controllers: [MulesoftController],
  providers: [MulesoftService],
})
export class MulesoftModule {}
