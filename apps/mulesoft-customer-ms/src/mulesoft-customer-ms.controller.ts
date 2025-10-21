import { Controller, NotFoundException, Req, RequestTimeoutException } from '@nestjs/common';
import { MulesoftCustomerMsService } from './mulesoft-customer-ms.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class MulesoftCustomerMsController {
  constructor(private readonly mulesoftCustomerMsService: MulesoftCustomerMsService) { }

  @MessagePattern('get-by-ani')
  async getCustomerByANI(ani: string): Promise<string> {
    return this.mulesoftCustomerMsService.getByANI(ani);
  }

  @MessagePattern('get-by-dni')
  async getCustomerByDNI(@Payload() { type, dni }: { type: string; dni: string }): Promise<string> {
    return this.mulesoftCustomerMsService.getByDNI(type, dni);
  }

  @MessagePattern('ping')
  ping(): string {
    return 'pong';
  }
}
