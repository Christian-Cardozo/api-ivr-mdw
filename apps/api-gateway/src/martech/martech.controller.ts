import { Body, Controller, Post } from '@nestjs/common';
import { MartechService } from './martech.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';

@Controller('martech')
@XmlResponse()
export class MartechController {
  constructor(private readonly martechService: MartechService) { }

  @Post()
  getOfertasMartech(
    @Body() body: any
  ) {
    return this.martechService.getOfertasMartech(body)
  }

  @Post()
  getEventosMartech(
    @Body() body: any
  ) {
    return this.martechService.getEventosMartech(body)
  }

}
