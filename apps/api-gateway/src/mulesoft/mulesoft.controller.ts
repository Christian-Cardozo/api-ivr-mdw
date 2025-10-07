import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';

@Controller('mulesoft')
export class MulesoftController {
  constructor(private readonly mulesoftService: MulesoftService) { }

  @Get('customer-management-ani/:ani')
  @XmlResponse()
  getMulesoftCustomerByANI(
    @Param('ani') ani: string
  ) {
    return this.mulesoftService.getMulesoftCustomerByANI(ani);
  }

  @Get('customer-management-dni/:dni')
  @XmlResponse()
  getMulesoftCustomerByDNI(
    @Param('dni') dni: string
    //@Query('type', new DefaultValuePipe('dni')) type: 'dni' | 'passport' | 'cuit',
  ) {
    return this.mulesoftService.getMulesoftCustomerByDNI(dni);
  }

  @Post('cancellation-process-accept')
  getMulesoftCancellationAccept(
    @Query() params: { xcorrelationid?: string; currentapplication?: string; currentcomponent?: string },
    @Body() body: any    
  ) {
    return this.mulesoftService.getMulesoftCancellationAccept(params, body);
  }

  @Get('cancellation-process-reject')
  getMulesoftCancellationReject(
    @Query() params: { xcorrelationid?: string; currentapplication?: string; currentcomponent?: string },
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftCancellationReject(params, body);
  }

  @Get('customer-bill-managment')
  getMulesoftCustomerBill() {
    return this.mulesoftService.getMulesoftCustomerBill();
  }

  @Get('payment-method')
  getMulesoftPaymentMethod() {
    return this.mulesoftService.getMulesoftPaymentMethod();
  }

  @Get('billing-account-debt')
  getMulesoftBillingAccountDebt() {
    return this.mulesoftService.getMulesoftBillingAccountDebt();
  }

  @Get('billing-account-balance')
  getMulesoftBillingAccountBalance() {
    return this.mulesoftService.getMulesoftBillingAccountBalance();
  }

  @Get('loans-offering')
  getMulesoftLoansOffering() {
    return this.mulesoftService.getMulesoftLoansOffering();
  }
}
