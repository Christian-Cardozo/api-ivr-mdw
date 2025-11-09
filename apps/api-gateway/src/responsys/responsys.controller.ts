import { Body, Controller, Post } from '@nestjs/common';
import { ResponsysService } from './responsys.service';

@Controller('responsys')
export class ResponsysController {
  constructor(private readonly responsysService: ResponsysService) { }

  @Post('rap')
  sendWhatsApp(
    @Body() body: any,
  ) {
    return this.responsysService.sendRap(body)
  }
}
