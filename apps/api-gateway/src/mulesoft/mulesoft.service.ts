import { HttpException, Inject, Injectable } from '@nestjs/common';
import { AuthClientService } from '@app/auth-client';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

@Injectable()
export class MulesoftService {

  constructor(
    private readonly authService: AuthClientService,
    @Inject('MULESOFT_CUSTOMER_MS') private readonly mulesoftClient: ClientProxy,
  ) { }

  getMulesoftCustomerByANI(ani: string): Observable<string> {

    return this.mulesoftClient.send<string, string>('get-by-ani', ani);

  }

  getMulesoftCustomerByDNI(dni: string): Observable<string> {

    return this.mulesoftClient.send<string, string>('get-by-dni', dni);

  }

  async getMulesoftCancellationAccept(params: any, body: any) {
    const url = "https://mule.telecom.com.ar/cancellation-process-api-prod/api/v1/retention/accept";
    const client = "67472340-c6fc-4345-b266-d082f1cbbfd6";
    const token = "";

    const { xcorrelationid, currentApplication, currentComponent } = params;

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

    return response.json;
  }

  async getMulesoftCancellationReject(params: any, body: any) {
    const url = "https://mule.telecom.com.ar/cancellation-process-api-prod/api/v1/retention/reject";
    const client = "67472340-c6fc-4345-b266-d082f1cbbfd6";
    const token = "";

    const { xcorrelationid, currentApplication, currentComponent } = params;

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

    return response.json;
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
