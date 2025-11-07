import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiInternalModule } from './api-internal.module';
import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { RpcToHttpInterceptor } from '@app/common/rpc-to-http.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(ApiInternalModule);

  // Inyección del ConfigService global
  const configService = app.get(ConfigService);
  const logger = new Logger('Api-Internal');

  app.setGlobalPrefix('api/ivr-int', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  
  // Puerto y host desde env/config
  const host = '0.0.0.0';
  const port = 3100;

  app.useGlobalInterceptors(new RpcToHttpInterceptor());
  app.enableShutdownHooks();
  
  await app.listen(port, host);
  logger.log(`🚀 Application running on http://${host}:${port}/api/ivr-int`);
}

bootstrap();
