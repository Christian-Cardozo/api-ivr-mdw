import { AuthClientService } from '@app/auth-client';
import { ResilienceService, RetryConfig } from '@app/resilience';
import { Retry } from '@app/resilience/retry.decorator';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MulesoftCustomerMsService {
  private readonly logger = new Logger(MulesoftCustomerMsService.name);
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly retryDelayMs: number;
  private readonly retryConfig: RetryConfig;

  constructor(
    private readonly authService: AuthClientService,
    private readonly resilience: ResilienceService, // 👈 Inyectar ResilienceService
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('MULE_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULE_CLIENT_ID') || '';
    this.timeout = this.configService.get<number>('MULE_TIMEOUT_MS', 100);
    this.maxRetries = this.configService.get<number>('MULE_RETRIES', 3);
    this.retryDelayMs = this.configService.get<number>('MULE_RETRY_DELAY_MS', 1000);

    this.retryConfig = {
      maxRetries: this.maxRetries,
      timeoutMs: this.timeout,
      retryDelayMs: this.retryDelayMs,
      retryOn: (error) => this.shouldRetry(error),
    };
  }


  //@Retry('mule:getByANI')
  async getByANI(ani: string, signal?: AbortSignal) {
    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&mobileNumber=${ani}`;

    return this.resilience.execute(
      'mule:getByANI',
      (signal) => this.fetchCustomer(url, signal),
      this.retryConfig,
    );
  }

  //@Retry('mule:getByDNI')
  async getByDNI(dni: string) {
    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&documentType=DNI&documentNumber=${dni}`;

    return this.resilience.execute(
      'mule:getByDNI',
      (signal) => this.fetchCustomer(url, signal),
      this.retryConfig,
    );
  }

  private async fetchCustomer(url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.clientId,
    };

    try {

      const response = await fetch(url, {
        method: 'GET',
        headers,
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

      return response.json();

    } catch (error) {
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