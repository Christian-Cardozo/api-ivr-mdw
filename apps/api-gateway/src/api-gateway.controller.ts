import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './api-gateway.service';
import { XmlService } from '@app/xml';
import { XmlResponse } from '@app/xml/xml-response.decorator';


@Controller()
export class ApiGatewayController {
  constructor(
    private readonly apiGatewayService: ApiGatewayService,    
  ) { }

  @Get()
  getHello(): string {
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
