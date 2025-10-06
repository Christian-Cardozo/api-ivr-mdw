import { Injectable } from '@nestjs/common';

@Injectable()
export class MulesoftCustomerMsService {
  getHello(): string {
    return 'Hello World!';
  }
}
