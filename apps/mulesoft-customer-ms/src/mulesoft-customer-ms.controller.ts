import { Controller, Get } from '@nestjs/common';
import { MulesoftCustomerMsService } from './mulesoft-customer-ms.service';

@Controller()
export class MulesoftCustomerMsController {
  constructor(private readonly mulesoftCustomerMsService: MulesoftCustomerMsService) {}

  @Get()
  getHello(): string {
    return this.mulesoftCustomerMsService.getHello();
  }
}
