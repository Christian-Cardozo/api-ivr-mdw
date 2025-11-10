import { Body, Controller, Post } from '@nestjs/common';
import { AmazonService } from './amazon.service';

@Controller('amazon')
export class AmazonController {
  constructor(private readonly amazonService: AmazonService) { }

  @Post('whats-app')
  sendWhatsApp(
    @Body() body: any,
  ) {
    return this.amazonService.sendWhatsApp(body)
  }
  
}
