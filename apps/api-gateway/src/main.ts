import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiGatewayModule } from './api-gateway.module';
import { RequestMethod } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Inyección del ConfigService global
  const configService = app.get(ConfigService);

  // Prefijo global (como ya tenías)
  app.setGlobalPrefix('api/ivr-mdw', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  // Puerto y host desde env/config
  const port = configService.get<number>('APP_PORT', 3000);
  const host = configService.get<string>('APP_HOST', '0.0.0.0');

  await app.listen(port, host);
  console.log(`🚀 API Gateway running on http://${host}:${port}/api/ivr-mdw`);
}

bootstrap();
