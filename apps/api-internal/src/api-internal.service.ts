import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiInternalService {
  getHello(): string {
    return 'Hello World!';
  }
}
