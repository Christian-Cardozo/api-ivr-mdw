import { Module } from '@nestjs/common';
import { ApiInternalController } from './api-internal.controller';
import { ApiInternalService } from './api-internal.service';
import { MatrizRuteoModule } from './matriz-ruteo/matriz-ruteo.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb',
        host:  config.get('DB_HOST') || 'localhost',
        port: config.get<number>('DB_PORT') || 3307,
        username: config.get('DB_USER') || 'mindadmin',
        password: config.get('DB_PASS') || 'nimdadnim',
        database: config.get('DB_NAME') || 'minddb',
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    MatrizRuteoModule,
    HealthModule],
  controllers: [ApiInternalController],
  providers: [ApiInternalService],
})
export class ApiInternalModule {}
