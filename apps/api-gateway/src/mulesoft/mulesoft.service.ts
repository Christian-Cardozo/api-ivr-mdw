import { HttpException, Inject, Injectable, Logger } from '@nestjs/common';
import { AuthClientService } from '@app/auth-client';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, Observable, of, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { ResilienceService } from '@app/resilience';

@Injectable()
export class MulesoftService {

  private readonly logger = new Logger(MulesoftService.name);
  private readonly cancelBaseUrl: string;
  private readonly billBaseUrl: string;
  private readonly cbsproductInventoryUrl: string;
  private readonly clientId: string;
  private hb?: NodeJS.Timeout;

  constructor(
    private readonly authService: AuthClientService,
    private readonly configService: ConfigService,
    private readonly resilienceService: ResilienceService,
    @Inject('MULESOFT_CUSTOMER_MS') private readonly mulesoftClient: ClientProxy,
  ) {
    this.cancelBaseUrl = this.configService.get<string>('MULESOFT_CANCEL_BASE_URL') || '';
    this.billBaseUrl = this.configService.get<string>('MULESOFT_BILL_BASE_URL') || '';
    this.cbsproductInventoryUrl = this.configService.get<string>('MULESOFT_CBS_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULESOFT_CLIENT_ID') || '';
  }

  async onModuleInit() {
    await this.ensureConnected();
    this.startHeartbeat(); // evita idle-close “silencioso”
  }

  onModuleDestroy() {
    if (this.hb) clearInterval(this.hb);
    this.mulesoftClient.close();
  }

  private async ensureConnected() {
    try {
      await this.mulesoftClient.connect();
      this.logger.log('TCP client conectado');
    } catch (e) {
      this.logger.warn(`Fallo connect(): ${e?.code || e?.message}. Reintentando...`);
      setTimeout(() => this.ensureConnected(), 1000);
    }
  }

  private startHeartbeat() {
    // “ping” cada 15s, timeout 5s. Si falla, forzá reconnect en el próximo send()
    this.hb = setInterval(async () => {
      try {
        await firstValueFrom(
          this.mulesoftClient.send<string, string>('ping', 'ok').pipe(
            timeout(5000),
            catchError(() => of('err')),
          ),
        );
      } catch { /* no-op */ }
    }, 15000);
  }


  getMulesoftCustomerByANI(ani: string): Observable<string> {
    return this.mulesoftClient.send<string, string>('get-by-ani', ani);
  }

  getMulesoftCustomerByDNI(type: string, dni: string): Observable<string> {
    return this.mulesoftClient.send<string, { type: string, dni: string }>('get-by-dni', { type, dni })
  }

  async getMulesoftCancellation(params: any, body: any) {
    const { xcorrelationid, currentApplication, currentComponent, action } = params;
    const url = `${this.cancelBaseUrl}/api/v1/retention/${action}`;
    const client = this.clientId;
    const token = await this.authService.getToken();


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

  async getMulesoftCustomerBill(params: any) {

    const { startTime, endTime, qoi, accountId } = params;

    const url = `${this.billBaseUrl}/customerBill?startTime=${startTime}&endTime=${endTime}&company=FAN&quantityOfInvoices=${qoi}&accountIntegrationId=${accountId}`

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

  getMulesoftLoansOffering() {
    return `This action returns all mulesoft`;
  }

  async getMulesoftcbsproductinventory(params: any) {
    const { ani } = params;

    const url = `${this.cbsproductInventoryUrl}/v1/statusDetail?primaryIdentity=${ani}`

  
    return this.resilienceService.execute(
      'cbs-product-inventory',
      (signal) => this.fetchcbsproductinventory(params, url, signal),
    )
  }

  async fetchcbsproductinventory(params: any, url: string, signal?: AbortSignal): Promise<any> {
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
}

