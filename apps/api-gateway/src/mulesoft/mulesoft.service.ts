import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { AuthClientService } from '@app/auth-client';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MulesoftService {

  private readonly logger = new Logger(MulesoftService.name);
  private readonly cancelBaseUrl: string;
  private readonly clientId: string;

  constructor(
    private readonly authService: AuthClientService,
    private readonly configService: ConfigService,
    @Inject('MULESOFT_CUSTOMER_MS') private readonly mulesoftClient: ClientProxy,
  ) { 
    this.cancelBaseUrl = this.configService.get<string>('MULESOFT_CANCEL_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULESOFT_CLIENT_ID') || '';
  }

  getMulesoftCustomerByANI(ani: string): Observable<string> {
    return this.mulesoftClient.send<string, string>('get-by-ani', ani);
  }

  getMulesoftCustomerByDNI(dni: string): Observable<string> {
    return this.mulesoftClient.send<string, string>('get-by-dni', dni)
  }

  async getMulesoftCancellation(params: any, body: any) {    
    const { xcorrelationid, currentApplication, currentComponent, action } = params;
    const url = `${this.cancelBaseUrl}/api/v1/retention/${action}`;
    const client = this.clientId;
    const token = this.authService.getToken();


    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'client_id': `${client}`,
      'x-correlation-id': `${xcorrelationid}`,
      'currentApplication': `${currentApplication}`,
      'currentComponent': `${currentComponent}`,
      'sourceApplication': 'IVR',
      'sourceComponent': 'Martech',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body,
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
  }

  getMulesoftCustomerBill() {
    return `This action returns all mulesoft`;
  }

  getMulesoftPaymentMethod() {
    return `This action returns all mulesoft`;
  }

  getMulesoftBillingAccountDebt() {
    return `This action returns all mulesoft`;
  }

  getMulesoftBillingAccountBalance() {
    return `This action returns all mulesoft`;
  }

  getMulesoftLoansOffering() {
    return `This action returns all mulesoft`;
  }
}
