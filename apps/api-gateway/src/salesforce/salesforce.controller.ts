import { Body, Controller, Post } from '@nestjs/common';
import { SalesforceService } from './salesforce.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';

@Controller('salesforce')
@XmlResponse()
export class SalesforceController {
  constructor(private readonly salesforceService: SalesforceService) {}

  @Post('product-offering')
  getProductOffering(
    @Body() body:any,
  ){
    this.salesforceService.getProductOffering(body);
  }

  @Post('integration-procedure')
  getIntegrationProcedure(
    @Body() body:any,
  ){
    this.salesforceService.getIntegrationProcedure(body);
  }
}
