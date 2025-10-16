import { Body, Controller, Get, HttpException, Param, Post, Query } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';
import { AniParamDto, DniParamDto } from './dtos/mulesoft.customer.dto';

@Controller('mulesoft')
export class MulesoftController {
  constructor(private readonly mulesoftService: MulesoftService) { }

  @Get('customer-management-ani/:ani')
  @XmlResponse()
  async getMulesoftCustomerByANI(
    @Param() { ani }: AniParamDto
  ) {
    return this.mulesoftService.getMulesoftCustomerByANI(ani);
  }

  @Get('customer-management-dni/:dni')
  @XmlResponse()
  async getMulesoftCustomerByDNI(
    @Param() { dni }: DniParamDto
  ) {
    return this.mulesoftService.getMulesoftCustomerByDNI(dni);
  }

  @Post('cancellation-process')
  getMulesoftCancellation(
    @Query() params: {
      xcorrelationid?: string;
      currentapplication?: string;
      currentcomponent?: string;
      action: 'accept' | 'reject';
    },
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftCancellation(params, body);
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
