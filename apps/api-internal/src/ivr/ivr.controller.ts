import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { IvrService } from './ivr.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';
import { MatrizRuteoService } from './matriz-ruteo/matriz-ruteo.service';
import { CalendarioDto, DiscaMatrizDto, EscenariosDto, FlagsDto, MatrizRuteoDto } from '../dtos/ivr.dto';
import { DiscaMatrizService } from './discamatriz/discamatriz.service';
import { EscenariosService } from './escenarios/escenarios.service';
import { FlagsService } from './flags/flags.service';
import { CalendarioService } from './calendario/calendario.service';

@Controller()
export class IvrController {
  constructor(
    private readonly ivrService: IvrService,
    private readonly matrizRuteoService: MatrizRuteoService,
    private readonly discaMatrizService: DiscaMatrizService,
    private readonly escenariosService: EscenariosService,
    private readonly flagsService: FlagsService,
    private readonly calendarioService: CalendarioService,
  ) { }

  @Get('calendario/:nombre')
  @XmlResponse()
  getCalendario(
    @Param() { nombre }: CalendarioDto,
  ) {
    return this.calendarioService.getCalendario(nombre)
  }

  @Get('discamatriz')
  @XmlResponse()
  getDiscaMatriz(
    @Query() params: DiscaMatrizDto,
  ) {
    return this.discaMatrizService.getDiscaMatriz(params)
  }

  @Get('escenarios')
  @XmlResponse()
  getEscenarios(
    @Query() params: EscenariosDto,
  ) {
    return this.escenariosService.getEscenarios(params)
  }

  @Get('flags')
  @XmlResponse()
  getFlags(
    @Query() params: FlagsDto,
  ) {
    return this.flagsService.getFlags(params)
  }

  @Post('matriz-ruteo')
  @HttpCode(200)
  @XmlResponse()
  getMatrizRuteo(
    @Body() body: MatrizRuteoDto,
  ) {
    return this.matrizRuteoService.resolverDerivacion(body)
  }

}
