import { Controller, NotFoundException, Req, RequestTimeoutException } from '@nestjs/common';
import { MulesoftCustomerMsService } from './mulesoft-customer-ms.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class MulesoftCustomerMsController {
  constructor(private readonly mulesoftCustomerMsService: MulesoftCustomerMsService) { }

  @MessagePattern('get-by-ani')
  async getCustomerByANI(ani:string): Promise<string> {
    return this.mulesoftCustomerMsService.getByANI(ani);
  }

  @MessagePattern('get-by-dni')
  async getCustomerByDNI(dni:string): Promise<string> {    
    return this.mulesoftCustomerMsService.getByDNI(dni);
  }
}
