import { NestFactory } from '@nestjs/core';
import { MulesoftCustomerMsModule } from './mulesoft-customer-ms.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { HttpToRpcFilter } from 'libs/common/http-to-rcp.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    MulesoftCustomerMsModule,
    {
      transport: Transport.TCP, // EL TRANSPORTADOR CLAVE
      options: {
        host: '0.0.0.0', // Nombre del servicio en Docker Compose '0.0.0.0'
        port: 3001, // Un puerto diferente al de la API Gateway (ej: 3000)
      },
    },
  );;
  app.useGlobalFilters(new HttpToRpcFilter()); 
  await app.listen();
}
bootstrap();
