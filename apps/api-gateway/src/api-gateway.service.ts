import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiGatewayService {

  constructor(
    private readonly configService: ConfigService,
  ) { }

  getHello(): string {
    return 'Hello World!!';
  }

  getEnv(): Record<string, any> {
    const env: Record<string, any> = {};

    for (const [key, value] of Object.entries(process.env)) {
      try {
        env[key] = JSON.parse(value as string);
      } catch {
        env[key] = value;
      }
    }

    return env;
  }


}
