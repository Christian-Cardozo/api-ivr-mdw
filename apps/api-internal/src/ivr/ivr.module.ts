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
import { PicPrioService } from './pic-prio/pic-prio.service';
import { InterrupcionesService } from './interrupciones/interrupciones.service';
import { LastCallService } from './last-call/last-call.service';
import { LogEventosService } from './log-eventos/log-eventos.service';
import { LogFinService } from './log-fin/log-fin.service';
import { MenuDinamicoService } from './menu-dinamico/menu-dinamico.service';
import { MovilLastCallService } from './movil-last-call/movil-last-call.service';
import { PipuFiService } from './pipu-fi/pipu-fi.service';
import { SocketService } from './socket/socket.service';
import { StatusService } from './status/status.service';
import { CalendarioService } from './calendario/calendario.service';

@Module({
  imports: [TypeOrmModule.forFeature([IvrappsMatrizRuteo, CalendarioServicio])],
  controllers: [IvrController],
  providers: [
    IvrService, 
    MatrizRuteoService,
    DiscamatrizService,
    EscenariosService,
    FlagsService,
    PicPrioService,
    InterrupcionesService,
    LastCallService,
    LogEventosService,
    LogFinService,
    MenuDinamicoService,
    MovilLastCallService,
    PipuFiService,
    SocketService,
    StatusService,
    CalendarioService,
  ],
})
export class IvrModule {}
