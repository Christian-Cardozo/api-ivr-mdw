import { Body, Controller, Post } from '@nestjs/common';
import { IceService } from './ice.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';

@Controller('ice')
@XmlResponse()
export class IceController {
  constructor(private readonly iceService: IceService) { }

  @Post('cobros')
  getCobros(
    @Body() body: any
  ) {
    this.iceService.getCobros(body)
  }
}
