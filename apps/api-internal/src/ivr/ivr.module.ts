import { Module } from '@nestjs/common';
import { IvrappsMatrizRuteo } from '../entities/ivrapps-matriz-ruteo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarioServicio } from '../entities/calendario-servicio.entity';
import { IvrService } from './ivr.service';
import { IvrController } from './ivr.controller';
import { MatrizRuteoService } from './matriz-ruteo/matriz-ruteo.service';
import { DiscamatrizService } from './discamatriz/discamatriz.service';
import { EscenariosService } from './escenarios/escenarios.service';
import { FlagsService } from './flags/flags.service';

@Module({
  imports: [TypeOrmModule.forFeature([IvrappsMatrizRuteo, CalendarioServicio])],
  controllers: [IvrController],
  providers: [
    IvrService, 
    MatrizRuteoService,
    DiscamatrizService,
    EscenariosService,
    FlagsService,
  ],
})
export class IvrModule {}
