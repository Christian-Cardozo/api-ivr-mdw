import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { IvrService } from './ivr.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';
import { MatrizRuteoService } from './matriz-ruteo/matriz-ruteo.service';
import { MatrizRuteoDto } from '../dtos/matriz-ruteo.dto';
import { DiscamatrizService } from './discamatriz/discamatriz.service';
import { EscenariosService } from './escenarios/escenarios.service';
import { FlagsService } from './flags/flags.service';

@Controller()
export class IvrController {
  constructor(
    private readonly ivrService: IvrService,
    private readonly matrizRuteoService: MatrizRuteoService,
    private readonly discaMatrizService: DiscamatrizService,
    private readonly escenariosService: EscenariosService,
    private readonly flagsService: FlagsService,
  ) { }

  @Post('matriz-ruteo')
  @HttpCode(200)
  @XmlResponse()
  getMatrizRuteo(
    @Body() body: MatrizRuteoDto,
  ) {
    return this.matrizRuteoService.resolverDerivacion(body)
  }

  @Get('discamatriz')  
  @XmlResponse()
  getDiscamatriz(
    @Query() params: any,
  ) {
    return this.discaMatrizService.getDiscamatriz(params)
  }

  @Get('escenarios')  
  @XmlResponse()
  getEscenarios(
    @Query() params: any,
  ) {
    return this.escenariosService.getEscenarios(params)
  }

  @Get('flags')  
  @XmlResponse()
  getFlags(
    @Query() params: any,
  ) {
    return this.flagsService.getFlags(params)
  }
}
