import { Controller, Get } from '@nestjs/common';
import { MulesoftService } from './mulesoft.service';

@Controller('mulesoft')
export class MulesoftController {
  constructor(private readonly mulesoftService: MulesoftService) { }

  @Get('customer-managment')
  getMulesoftCustomer() {
    return this.mulesoftService.getMulesoftCustomer();
  }

  @Get('cancellation-process')
  getMulesoftCancellation() {
    return this.mulesoftService.getMulesoftCancellation();
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
