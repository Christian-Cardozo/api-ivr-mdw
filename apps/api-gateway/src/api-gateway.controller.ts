import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';
import { ConfigService } from '@nestjs/config';



@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,
    private readonly configService: ConfigService,    
  ) { }

  @Get()
  getHello(): string {
    const REDIS_PORT = this.configService.get<number>('REDIS_PORT');
    console.log('REDIS_PORT', REDIS_PORT);
    return this.apiGatewayService.getHello();
  }

  @Get('example-ok')
  @XmlResponse()
  async getExampleOK() {
    const response = await fetch('https://www.google.com.ar');
    const data = await response.text();

    return {
      data,
      status: response.status,
      statusText: response.statusText,
    };
  }

  @Get('example-error')
  getExampleERROR(): string {
    return this.apiGatewayService.getHello();
  }

}
