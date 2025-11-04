import { AuthClientService } from '@app/auth-client';
import { ResilienceConfig, ResilienceService } from '@app/resilience';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MulesoftDigitalBillingMsService {

  private readonly logger = new Logger(MulesoftDigitalBillingMsService.name);
  private readonly baseUrl: string;
  private readonly env: string;
  private readonly clientId: string;
  private readonly ResilienceConfig: ResilienceConfig;

  constructor(
    private readonly authService: AuthClientService,
    private readonly resilienceService: ResilienceService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('MULESOFT_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULESOFT_CLIENT_ID') || '';
    this.env = this.configService.get<string>('APP_ENV') || '';

    this.ResilienceConfig = {
      maxRetries: this.configService.get<number>('MULESOFT_DIGITAL_BILLING_RETRIES', 2),
      timeoutMs: this.configService.get<number>('MULESOFT_DIGITAL_BILLING_TIMEOUT_MS', 5000),
      retryDelayMs: this.configService.get<number>('MULESOFT_DIGITAL_BILLING_RETRY_DELAY_MS', 1000),
      circuitBreakerEnabled: this.configService.get<boolean>('MULESOFT_DIGITAL_BILLING_CB_ENABLED') || false,
      retryOn: (error) => this.shouldRetry(error),
    };
  }

  async payment(body: any): Promise<string> {
    const url = `${this.baseUrl}/digital-billing-mngmt-papi-${this.env}/v1/cyclic`;

    //console.log(this.ResilienceConfig)    
    return this.resilienceService.execute(
      'mule:payment',
      (signal) => this.fetchPayment(body, url, signal),
      this.ResilienceConfig,
    );
  }

  private async fetchPayment(body: any, url: string, signal?: AbortSignal): Promise<string> {
    const token = await this.authService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.clientId,
      /*'x-correlation-id': `${xcorrelationid}`,
      'currentApplication': `IVR_SOS`,
      'currentComponent': `IVR_SOS`,
      'sourceApplication': 'IVR_SOS',
      'sourceComponent': 'Loan_SOS',*/
    };

    try {

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal,
      });

      if (!response.ok) {
        const txt = await response.text();

        throw new HttpException(
          {
            message: txt || 'Upstream error',
            statusText: response.statusText,
          },
          response.status,
        );
      }

      return await response.json();

    }
    catch (error) {
      // 👈 Si es AbortError (timeout), convertir a RequestTimeoutException
      if (error.name === 'AbortError') {
        this.logger.error(`⏱️ Request abortada por timeout: ${url}`);
        throw new HttpException('Request timeout', 408);
      }

      // 👈 Si es 401, invalidar token (el retry lo maneja ResilienceService)
      if (error instanceof HttpException && error.getStatus() === 401) {
        this.logger.warn('Received 401, invalidating token');
        await this.authService.invalidateToken();
      }

      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Si es un HttpException de NestJS
    if (error instanceof HttpException) {
      const status = error.getStatus();

      // ✅ Reintentar 401 (token expirado)
      if (status === 401) {
        return true;
      }

      // ✅ Reintentar 408 (timeout)
      if (status === 408) {
        return true;
      }

      // ✅ Reintentar 5xx (errores del servidor)
      if (status >= 500) {
        return true;
      }

      // ❌ NO reintentar 4xx (errores del cliente: 400, 403, 404, etc.)
      return false;
    }

    // ✅ Reintentar errores de red
    if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return true;
    }

    // ✅ Por defecto, reintentar
    return true;
  }
}
