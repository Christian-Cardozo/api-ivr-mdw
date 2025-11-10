import { Body, Controller, Param, Post } from '@nestjs/common';
import { QualtricsService } from './qualtrics.service';

@Controller('qualtrics')
export class QualtricsController {
  constructor(private readonly qualtricsService: QualtricsService) { }

  @Post('/:key')
  sendSurvey(
    @Param() { key }: any,
    @Body() body: any,
  ) {
    this.qualtricsService.sendSurvey(key, body)
  }
}
