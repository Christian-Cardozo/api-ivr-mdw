import { HttpException, Injectable } from '@nestjs/common';
import { AuthClientService } from '@app/auth-client';

@Injectable()
export class MulesoftService {

  constructor(
    private readonly authService: AuthClientService,
  ) {}

  async getMulesoftCustomerByANI(ani:string) {
    
    const url = `https://mule.telecom.com.ar/customer-mngmt-proc-api-prod/api/v1/customer?excludeNulls=true&deepLevel=3&mobileNumber=${ani}`
    const client = "67472340-c6fc-4345-b266-d082f1cbbfd6";
    const token = await this.authService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'client_id': `${client}`,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return response.json();
  }

  async getMulesoftCustomerByDNI(dni:string) {
    
    const url = `https://mule.telecom.com.ar/customer-mngmt-proc-api-prod/api/v1/customer?excludeNulls=true&deepLevel=3&documentType=DNI&documentNumber=${dni}`
    const client = "67472340-c6fc-4345-b266-d082f1cbbfd6";
    const token = await this.authService.getToken();;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'client_id': `${client}`,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return response.json();
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
