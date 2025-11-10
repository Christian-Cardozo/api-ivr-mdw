import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { XscaleService } from './xscale.service';
import { BillingInvoicesDto, CustomerSubscribersDto, PaymentCouponsDto, PaymentDto, TranBDto } from './dtos/xscale.dtos';
import { XmlResponse } from '@app/xml/xml-response.decorator';

@Controller('xscale')
@XmlResponse()
export class XscaleController {
  constructor(private readonly xscaleService: XscaleService) { }

  @Get('outage-manager/:ani')
  getXscaleOutageManagerStatus(
    @Param('ani') ani: string,
  ) {
    return this.xscaleService.getOutageManagerStatus(ani);
  }

  @Get('payment-coupons/:type/:dni')
  getPaymentCoupons(
    @Param() { type, dni }: PaymentCouponsDto,
  ) {
    return this.xscaleService.getPaymentCoupons(type, dni);
  }

  @Get('billing-invoices/:subscriptionId')
  getBillingInvoices(
    @Param() { subscriptionId }: BillingInvoicesDto,
  ) {
    return this.xscaleService.getBillingInvoices(subscriptionId);
  }

  @Get('customer-subscribers/:type/:cuic')
  getCustomerSubscribers(
    @Param() { type, cuic }: CustomerSubscribersDto,
  ) {
    return this.xscaleService.getCustomerSubscribers(type, cuic);
  }

  @Post('payment')
  getPayment(
    @Body() body: PaymentDto,
  ) {
    return this.xscaleService.getPayment(body);
  }

  @Post('tranb/:ani')
  getTranB(
    @Param() { ani }: TranBDto,
  ) {
    return this.xscaleService.getTranB(ani);
  }
}
