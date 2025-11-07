import { Module } from '@nestjs/common';
import { MatrizRuteoService } from './matriz-ruteo.service';
import { MatrizRuteoController } from './matriz-ruteo.controller';
import { IvrappsMatrizRuteo } from '../entities/ivrapps-matriz-ruteo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarioServicio } from '../entities/calendario-servicio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IvrappsMatrizRuteo, CalendarioServicio])],
  controllers: [MatrizRuteoController],
  providers: [MatrizRuteoService],
})
export class MatrizRuteoModule {}
