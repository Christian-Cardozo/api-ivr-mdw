import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MatrizRuteoService } from './matriz-ruteo.service';
import { MatrizRuteoDto } from './dtos/matriz-ruteo.dto';
import { XmlResponse } from '@app/xml/xml-response.decorator';

@Controller('matriz-ruteo')
export class MatrizRuteoController {
  constructor(private readonly matrizRuteoService: MatrizRuteoService) { }

  @Post()
  @HttpCode(200)
  @XmlResponse()
  getMatrizRuteo(
    @Body() body: MatrizRuteoDto,
  ) {
    return this.matrizRuteoService.resolverDerivacion(body)
  }
}
