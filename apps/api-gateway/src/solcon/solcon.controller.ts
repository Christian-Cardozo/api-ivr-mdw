import { Body, Controller, Post } from '@nestjs/common';
import { SolconService } from './solcon.service';

@Controller('solcon')
export class SolconController {
  constructor(private readonly solconService: SolconService) { }

  @Post('context-store-create')
  getContextStoreCreate(
    @Body() body: any,
  ) {
    return this.solconService.getContextStoreCreate(body)
  }
}
