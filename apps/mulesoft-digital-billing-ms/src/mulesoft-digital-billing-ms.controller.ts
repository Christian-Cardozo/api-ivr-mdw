import { Controller, Get } from '@nestjs/common';
import { MulesoftDigitalBillingMsService } from './mulesoft-digital-billing-ms.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MulesoftDigitalBillingMsController {
  constructor(private readonly mulesoftDigitalBillingMsService: MulesoftDigitalBillingMsService) { }

  @MessagePattern('digital-billing')
  async getCustomerByDNI(@Payload() body: any): Promise<string> {
    return this.mulesoftDigitalBillingMsService.payment(body);
  }

  @MessagePattern('ping')
  ping(): string {
    return 'pong';
  }
}
