import { NestFactory } from '@nestjs/core';
import { MulesoftCustomerMsModule } from './mulesoft-customer-ms.module';

async function bootstrap() {
  const app = await NestFactory.create(MulesoftCustomerMsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
