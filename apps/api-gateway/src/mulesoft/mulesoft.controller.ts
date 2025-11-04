import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';
import { AniParamDto, CustomerBillDto, DniParamDto, CbsProductInventoryDto, ContactDto, CancellationDto } from './dtos/mulesoft.customer.dto';

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

  @Get('customer-management/:type/:dni')
  @XmlResponse()
  async getMulesoftCustomerByDNI(
    @Param() { type, dni }: DniParamDto,
  ) {
    return this.mulesoftService.getMulesoftCustomerByDNI(type, dni);
  }

  @Post('cancellation-process')
  getMulesoftCancellation(
    @Query() params: CancellationDto,
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftCancellation(params, body);
  }

  @Get('customer-bill-management')
  @XmlResponse()
  getMulesoftCustomerBill(
    @Query() params: CustomerBillDto
  ) {
    return this.mulesoftService.getMulesoftCustomerBill(params);
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

  @Get('cbs-product-inventory')
  @XmlResponse()
  getMulesoftCbsProductInventory(
    @Query() params: CbsProductInventoryDto
  ) {
    return this.mulesoftService.getMulesoftCbsProductInventory(params);
  }

  @Get('contact-management/:ani')
  @XmlResponse()
  getMulesoftContact(@Param() { ani }: ContactDto) {
    return this.mulesoftService.getMulesoftContact(ani);
  }
}
