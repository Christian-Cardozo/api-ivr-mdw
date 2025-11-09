import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';
import { XmlResponse } from '@app/xml/xml-response.decorator';
import { AniParamDto, CustomerBillDto, DniParamDto, CbsProductInventoryDto, ContactDto, CancellationDto, LoansOfferringDto, YoizenDto, DigitalBillingDto, AdditionalOrderingDto, CustumerCorpoDto } from './dtos/mulesoft.customer.dto';

@Controller('mulesoft')
@XmlResponse()
export class MulesoftController {
  constructor(private readonly mulesoftService: MulesoftService) { }

  @Get('customer-management-ani/:ani')
  async getMulesoftCustomerByANI(
    @Param() { ani }: AniParamDto
  ) {
    return this.mulesoftService.getMulesoftCustomerByANI(ani);
  }

  @Get('customer-management/:type/:dni')  
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
  getMulesoftCustomerBill(
    @Query() params: CustomerBillDto
  ) {
    return this.mulesoftService.getMulesoftCustomerBill(params);
  }

  @Post('payment-method')  
  getMulesoftPaymentMethod(
    @Query() params: any,
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftPaymentMethod(params, body);
  }  

  @Get('billing-account-balance')  
  getMulesoftBillingAccountBalance() {
    return this.mulesoftService.getMulesoftBillingAccountBalance();
  }

  @Post('loans-offering')  
  getMulesoftLoansOffering(
    @Query() params: LoansOfferringDto,
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftLoansOffering(params, body);
  }

  @Get('cbs-product-inventory')  
  getMulesoftCbsProductInventory(
    @Query() params: CbsProductInventoryDto
  ) {
    return this.mulesoftService.getMulesoftCbsProductInventory(params);
  }

  @Get('contact-management/:ani')  
  getMulesoftContact(@Param() { ani }: ContactDto) {
    return this.mulesoftService.getMulesoftContact(ani);
  }

  @Post('yoizen-management')  
  getMulesoftYoizen(
    @Body() body: YoizenDto
  ) {
    return this.mulesoftService.getMulesoftYoizen(body);
  }

  @Post('digital-billing-management')  
  getMulesoftDigitalBilling(
    @Query() params: DigitalBillingDto,
    @Body() body: any,
  ) {    
    return this.mulesoftService.getMulesoftDigitalBilling(params, body);
  }

  @Post('additional-ordering')  
  getMulesoftAdditionalOrdering(
    @Query() params: AdditionalOrderingDto,
    @Body() body: any
  ) {
    return this.mulesoftService.getMulesoftAdditionalOrdering(params, body);
  }

 @Get('customer-management-corpo/:cuit')  
  getMulesoftCustomerManagementCorpo(@Param() { cuit }: CustumerCorpoDto) {
    return this.mulesoftService.getMulesoftCustomerManagementCorpo(cuit);
  }

  @Get('billing-account-debt/:accountIntegrationId')  
  getMulesoftBillingAccountDebt(
    @Param() { accountIntegrationId }: any,
    @Query() params: any
  ) {
    return this.mulesoftService.getMulesoftBillingAccountDebt(accountIntegrationId, params);
  }
}
