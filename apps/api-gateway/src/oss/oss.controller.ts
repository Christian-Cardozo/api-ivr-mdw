import { Body, Controller, Post } from '@nestjs/common';
import { OssService } from './oss.service';

@Controller('oss')
export class OssController {
  constructor(private readonly ossService: OssService) { }

  @Post('event-to-kafka')
  getEventToKafka(
    @Body() body: any,
  ) {
    return this.ossService.getEventToKafka(body)
  }
}
