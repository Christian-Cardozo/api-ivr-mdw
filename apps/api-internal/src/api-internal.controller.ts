import { Controller, Get } from '@nestjs/common';
import { ApiInternalService } from './api-internal.service';

@Controller()
export class ApiInternalController {
  constructor(private readonly apiInternalService: ApiInternalService) {}

  @Get()
  getHello(): string {
    return this.apiInternalService.getHello();
  }
}
