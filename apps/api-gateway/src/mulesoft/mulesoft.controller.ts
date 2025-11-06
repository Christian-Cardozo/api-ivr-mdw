import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';
import { AniParamDto, CustomerBillDto, DniParamDto, CbsProductInventoryDto, ContactDto, CancellationDto, LoansOfferringDto, YoizenDto, DigitalBillingDto, AdditionalOrderingDto } from './dtos/mulesoft.customer.dto';

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
  @XmlResponse()
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
  @XmlResponse()
  getMulesoftPaymentMethod() {
    return this.mulesoftService.getMulesoftPaymentMethod();
  }

  @Get('billing-account-debt')
  @XmlResponse()
  getMulesoftBillingAccountDebt() {
    return this.mulesoftService.getMulesoftBillingAccountDebt();
  }

  @Get('billing-account-balance')
  @XmlResponse()
  getMulesoftBillingAccountBalance() {
    return this.mulesoftService.getMulesoftBillingAccountBalance();
  }

  @Post('loans-offering')
  @XmlResponse()
  getMulesoftLoansOffering(
    @Query() params: LoansOfferringDto,
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftLoansOffering(params, body);
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

  @Post('yoizen-management')
  @XmlResponse()
  getMulesoftYoizen(
    @Body() body: YoizenDto
  ) {
    return this.mulesoftService.getMulesoftYoizen(body);
  }

  @Post('digital-billing-management')
  @XmlResponse()
  getMulesoftDigitalBilling(
    @Body() body: DigitalBillingDto
  ) {
    console.log('asdasdasdasd')
    return this.mulesoftService.getMulesoftDigitalBilling(body);
  }

  @Post('additional-ordering')
  @XmlResponse()
  getMulesoftAdditionalOrdering(
    @Query() params: AdditionalOrderingDto,
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftAdditionalOrdering(params, body);
  }


}
