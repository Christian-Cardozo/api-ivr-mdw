import { AuthClientService } from '@app/auth-client';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResilienceService } from '@app/resilience';

@Injectable()
export class MulesoftCustomerMsService {
  private readonly logger = new Logger(MulesoftCustomerMsService.name);
  private baseUrl: string;
  private clientId: string;
  private timeout: number;
  private maxRetries: number;

  constructor(
    private readonly authService: AuthClientService,
    private readonly configService: ConfigService,
    private readonly resilience: ResilienceService,
  ) {
    this.baseUrl = this.configService.get<string>('MULE_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULE_CLIENT_ID') || '';
    this.timeout = this.configService.get<number>('MULE_TIMEOUT_MS', 10000);
    this.maxRetries = this.configService.get<number>('MULE_RETRIES', 3);
  }

  async getByANI(ani: string) {
    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&mobileNumber=${ani}`;

    return this.resilience.executeWithResilience(
      'mule:getByANI',
      () => this.callMule(url),
      {
        maxRetries: this.maxRetries,
        timeout: this.timeout,
        retryDelay: 1000,
        circuitBreaker: true,
      },
    );
  }

  async getByDNI(dni: string) {
    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&documentType=DNI&documentNumber=${dni}`;

    return this.resilience.executeWithResilience(
      'mule:getByDNI',
      () => this.callMule(url),
      {
        maxRetries: this.maxRetries,
        timeout: this.timeout,
        retryDelay: 1000,
        circuitBreaker: true,
      },
    );
  }

  /**
   * Método privado para llamar a Mule
   */
  private async callMule(url: string, retryCount = 0): Promise<any> {
    const token = await this.authService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      client_id: this.clientId,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Si es 401 y es el primer intento, invalidar token y reintentar
        if (response.status === 401 && retryCount === 0) {
          this.logger.warn('Received 401, invalidating token');
          await this.authService.invalidateToken();
          const newToken = await this.authService.getToken();
          headers.Authorization = `Bearer ${newToken}`;

          const retryResponse = await fetch(url, {
            method: 'GET',
            headers,
            signal: controller.signal,
          });

          if (!retryResponse.ok) {
            const txt = await retryResponse.text();
            throw new HttpException(
              { message: txt || 'Upstream error', statusText: retryResponse.statusText },
              retryResponse.status,
            );
          }

          return retryResponse.json();
        }

        const txt = await response.text();
        throw new HttpException(
          { message: txt || 'Upstream error', statusText: response.statusText },
          response.status,
        );
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // Distinguir entre timeout y otros errores
      if (error.name === 'AbortError') {
        this.logger.error(`⏱️ Timeout llamando a Mule: ${url}`);
        throw new HttpException('Request timeout', 408);
      }

      throw error;
    }
  }

  /**
   * Obtener estado de los circuit breakers
   */
  getCircuitBreakerStatus() {
    return {
      getByANI: this.resilience.getCircuitBreakerState('mule:getByANI'),
      getByDNI: this.resilience.getCircuitBreakerState('mule:getByDNI'),
    };
  }
}