import { AuthClientService } from '@app/auth-client';
import { AuthTokenConfig } from '@app/auth-client/interfaces/auth-config.interface';
import { ResilienceService, ResilienceConfig } from '@app/resilience';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MulesoftCustomerMsService {
  private readonly logger = new Logger(MulesoftCustomerMsService.name);
  private readonly baseUrl: string;
  private readonly env: string;
  private readonly clientId: string;
  private readonly ResilienceConfig: ResilienceConfig;
  private readonly authTokenConfig: AuthTokenConfig;

  private ROUTES_TO_DELETE: string[][] = [
    ['accounts', 'billingAddress'],
    ['subscriptions', 'serviceAccount'],
    ['subscriptions', 'mainProduct', 'productSpecification', 'externalReferences'],
    ['subscriptions', 'mainProduct', 'serviceAccount'],
    ['subscriptions', 'mainProduct', 'customer'],
    ['subscriptions', 'customer'],
  ];

  constructor(
    private readonly authService: AuthClientService,
    private readonly resilienceService: ResilienceService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('MULESOFT_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULESOFT_CLIENT_ID') || '';
    this.env = this.configService.get<string>('APP_ENV') || '';

    this.authTokenConfig = {
      url: this.configService.get<string>('MULESOFT_AUTH_TOKEN_URL') || '',
      userkey: this.configService.get<string>('MULESOFT_AUTH_USERKEY') || '',
      key: 'idp:mule:token',
    };

    this.ResilienceConfig = {
      maxRetries: this.configService.get<number>('MULESOFT_CUSTOMER_RETRIES', 2),
      timeoutMs: this.configService.get<number>('MULESOFT_CUSTOMER_TIMEOUT_MS', 5000),
      retryDelayMs: this.configService.get<number>('MULESOFT_CUSTOMER_RETRY_DELAY_MS', 1000),
      circuitBreakerEnabled: this.configService.get<boolean>('MULESOFT_CUSTOMER_CB_ENABLED') || false,
      retryOn: (error) => this.shouldRetry(error),
    };
  }

  //@Retry('mule:getByANI')
  async getByANI(ani: string) {
    const url = `${this.baseUrl}/customer-mngmt-proc-api-${this.env}/api/v1/customer?excludeNulls=true&deepLevel=3&mobileNumber=${ani}`;

    return this.resilienceService.execute(
      'mule:getByANI',
      (signal) => this.fetchCustomer(url, signal),
      this.ResilienceConfig,
    );
  }

  //@Resilience('mule:getByDNI')
  async getByDNI(type: string, dni: string) {
    const url = `${this.baseUrl}/customer-mngmt-proc-api-${this.env}/api/v1/customer?excludeNulls=true&deepLevel=3&documentType=${type}&documentNumber=${dni}`;

    //console.log(this.ResilienceConfig)    
    return this.resilienceService.execute(
      'mule:getByDNI',
      (signal) => this.fetchCustomer(url, signal),
      this.ResilienceConfig,
    );
  }

  private async fetchCustomer(url: string, signal?: AbortSignal): Promise<any> {
    const token = await this.authService.getToken(this.authTokenConfig);

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

      const body = await response.json();
      const pruned = this.prunePathsInPlace(body, this.ROUTES_TO_DELETE);
      //return pruned;
      return body;

    } catch (error) {
      // 👈 Si es AbortError (timeout), convertir a RequestTimeoutException
      if (error.name === 'AbortError') {
        this.logger.error(`⏱️ Request abortada por timeout: ${url}`);
        throw new HttpException('Request timeout', 408);
      }

      // 👈 Si es 401, invalidar token (el retry lo maneja ResilienceService)
      if (error instanceof HttpException && error.getStatus() === 401) {
        this.logger.warn('Received 401, invalidating token');
        await this.authService.invalidateToken(this.authTokenConfig.key);
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

  private deletePath(node: any, path: string[]): void {
    if (!node || path.length === 0) return;

    if (Array.isArray(node)) {
      for (const el of node) this.deletePath(el, path);
      return;
    }
    if (typeof node !== 'object') return;

    if (path.length === 1) {
      delete (node as Record<string, unknown>)[path[0]];
      return;
    }

    const [key, ...rest] = path;
    const next = (node as any)[key];
    if (next == null) return;

    if (Array.isArray(next)) {
      for (const sub of next) this.deletePath(sub, rest);
    } else if (typeof next === 'object') {
      this.deletePath(next, rest);
    }
  }

  private prunePathsInPlace(root: any, paths: string[][]): void {
    if (Array.isArray(root)) {
      for (const item of root) for (const p of paths) this.deletePath(item, p);
    } else if (root && typeof root === 'object') {
      for (const p of paths) this.deletePath(root, p);
    }
  }

}