import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiGatewayModule } from './api-gateway.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { RpcToHttpInterceptor } from '@app/common/rpc-to-http.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  // Inyección del ConfigService global
  const configService = app.get(ConfigService);
  const logger = new Logger('Api-Gateway');

  app.setGlobalPrefix('api/ivr-mdw', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  
  // Puerto y host desde env/config
  const port = configService.get<number>('APP_PORT', 3000);
  const host = configService.get<string>('APP_HOST', '0.0.0.0');

  app.useGlobalInterceptors(new RpcToHttpInterceptor());
  await app.listen(port, host);
  logger.log(`🚀 Application running on http://${host}:${port}/api/ivr-mdw`);
}

bootstrap();
