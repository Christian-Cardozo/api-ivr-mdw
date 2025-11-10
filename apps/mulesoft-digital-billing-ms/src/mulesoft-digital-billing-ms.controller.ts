import { Controller } from '@nestjs/common';
import { MulesoftDigitalBillingMsService } from './mulesoft-digital-billing-ms.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MulesoftDigitalBillingMsController {
  constructor(private readonly mulesoftDigitalBillingMsService: MulesoftDigitalBillingMsService) { }

  @MessagePattern('digital-billing')
  async getCustomerByDNI(@Payload() { params, body }: any): Promise<string> {    
    return this.mulesoftDigitalBillingMsService.payment(params, body);
  }

  @MessagePattern('ping')
  ping(): string {
    return 'pong';
  }
}
