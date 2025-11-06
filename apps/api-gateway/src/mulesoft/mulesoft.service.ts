import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { AuthClientService } from '@app/auth-client';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, Observable, of, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ResilienceService } from '@app/resilience';

@Injectable()
export class MulesoftService {

  private readonly logger = new Logger(MulesoftService.name);
  private readonly clientId: string;
  private readonly corpoContactClientId: string;
  private readonly baseUrl: string;
  private readonly env: string;
  private hb?: NodeJS.Timeout;

  constructor(
    private readonly authService: AuthClientService,
    private readonly configService: ConfigService,
    private readonly resilienceService: ResilienceService,
    @Inject('MULESOFT_CUSTOMER_MS') private readonly mulesoftCustomerClient: ClientProxy,
    @Inject('MULESOFT_DIGITAL_BILLING_MS') private readonly mulesoftDigitalBillingClient: ClientProxy,
  ) {
    this.baseUrl = this.configService.get<string>('MULESOFT_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULESOFT_CLIENT_ID') || '';
    this.corpoContactClientId = this.configService.get<string>('MULESOFT_CORPOCONTACT_CLIENT_ID') || '';
    this.env = this.configService.get<string>('APP_ENV') || '';
  }  

  getMulesoftCustomerByANI(ani: string): Observable<string> {
    return this.mulesoftCustomerClient.send<string, string>('get-by-ani', ani);
  }

  getMulesoftCustomerByDNI(type: string, dni: string): Observable<string> {
    return this.mulesoftCustomerClient.send<string, { type: string, dni: string }>('get-by-dni', { type, dni })
  }

  getMulesoftDigitalBilling(body: any): Observable<string> {
    console.log('asdasdasdasd')
    return this.mulesoftDigitalBillingClient.send<string, any>('digital-billing', body)
  }

  async getMulesoftCancellation(params: any, body: any) {
    const { action } = params;
    const url = `${this.baseUrl}/cancellation-process-api-${this.env}/api/v1/retention/${action}`;

    return this.resilienceService.execute(
      'mule:cancellation',
      () => this.fetchMulesoftCancellation(params, url, body),
    );
  }

  async fetchMulesoftCancellation(params: any, url: string, body: any) {
    const { xcorrelationid } = params;
    const token = await this.authService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'client_id': this.clientId,
      'x-correlation-id': `${xcorrelationid}`,
      'currentApplication': `IVR`,
      'currentComponent': `IVR`,
      'sourceApplication': 'IVR',
      'sourceComponent': 'Martech',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
  }

  async getMulesoftCustomerBill(params: any) {

    const { startTime, endTime, qoi, accountId } = params;
    const url = `${this.baseUrl}/customer-bill-mngmt-papi-${this.env}/v1/customerBill?startTime=${startTime}&endTime=${endTime}&company=FAN&quantityOfInvoices=${qoi}&accountIntegrationId=${accountId}`

    return this.resilienceService.execute(
      'mule:bill',
      (signal) => this.fetchCustomerBill(url, signal),
    )
  }

  async fetchCustomerBill(url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.clientId,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      signal
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
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

  async getMulesoftLoansOffering(params: any, body: any) {
    const url = `${this.baseUrl}/salesforce-loans-offering-sapi-${this.env}/api/v1/getAvailableLoans`

    return this.resilienceService.execute(
      'mule:loans-offering',
      (signal) => this.fetchLoansOffering(params, body, url, signal),
    )
  }

  async fetchLoansOffering(params: any, body: any, url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getToken();
    const { xcorrelationid, } = params

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.clientId,
      'x-correlation-id': `${xcorrelationid}`,
      'currentApplication': `IVR_SOS`,
      'currentComponent': `IVR_SOS`,
      'sourceApplication': 'IVR_SOS',
      'sourceComponent': 'Loan_SOS',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
      signal
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
  }

  async getMulesoftCbsProductInventory(params: any) {
    const { ani } = params;
    const url = `${this.baseUrl}/cbs-product-inventory-mngmnt-sapi-${this.env}/v1/statusDetail?primaryIdentity=${ani}`

    return this.resilienceService.execute(
      'mule:cbs-product-inventory',
      (signal) => this.fetchCbsProductInventory(params, url, signal),
    )
  }

  async fetchCbsProductInventory(params: any, url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getToken();
    const { xcorrelationid, } = params

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.clientId,
      'x-correlation-id': `${xcorrelationid}`,
      'currentApplication': `IVR`,
      'currentComponent': `IVR`,
      'sourceApplication': 'IVR',
      'sourceComponent': 'IVR_Cosulta_Saldo',
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      signal
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
  }

  async getMulesoftContact(ani: string) {

    const url = `${this.baseUrl}/contact-mngmt-papi-${this.env}/api/contact?fields=relatedRoles&excludeNulls=true&filtering=telephoneNumber=${ani}`

    return this.resilienceService.execute(
      'mule:contact',
      (signal) => this.fetchMulesoftContact(url, signal),
    )
  }

  async fetchMulesoftContact(url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getCustomToken('idp:mule:contact:token', 'MULESOFT_CORPOCONTACT_CLIENT_ID');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.corpoContactClientId.split(':')[0],
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
      signal
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
  }

  async getMulesoftYoizen(body: any) {
    const url = `${this.baseUrl}/yoizen-mngmt-papi-${this.env}/api/contactwpysocial`

    return this.resilienceService.execute(
      'mule:yoizen',
      (signal) => this.fetchYoizen(body, url, signal),
    )
  }

  async fetchYoizen(body: any, url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      //client_id: this.clientId,      
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: body,
      signal
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
  }

  async getMulesoftAdditionalOrdering(params: any, body: any) {

    const url = `${this.baseUrl}/prod-order-mngmt-papi-${this.env}/api/v1/additionalOrder`

    return this.resilienceService.execute(
      'additional-ordering',
      (signal) => this.fetchAdditionalOrdering(params, body, url, signal),
    )
  }

  async fetchAdditionalOrdering(params: any, body: any, url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getToken();
    const { xcorrelationid } = params

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.clientId,
      'x-correlation-id': `${xcorrelationid}`,
      'currentApplication': `IVR`,
      'currentComponent': `IVR`,
      'sourceApplication': 'IVR',
      'sourceComponent': 'Activacion Pack',
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return await response.json();
  }


}

