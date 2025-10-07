import { Module } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { MulesoftController } from './mulesoft.controller';
import { AuthClientModule } from '@app/auth-client';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    AuthClientModule,
    ClientsModule.register([
      {
        name: 'MULESOFT_CUSTOMER_MS',
        transport: Transport.TCP,
        options: {
          host: 'localhost',
          //host: 'mulesoft-customer', // Nombre del servicio en Docker Compose
          port: 3001,
        },
      },
    ])
  ],
  controllers: [MulesoftController],
  providers: [MulesoftService],
})
export class MulesoftModule { }
