import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env`, 
      ignoreEnvVars: false,       // process.env (Docker/CI) pisa al archivo
    }),
  ],
})
export class GlobalConfigModule {}
