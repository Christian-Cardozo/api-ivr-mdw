import { AuthClientService } from '@app/auth-client';
import { HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MulesoftCustomerMsService {
  private readonly logger = new Logger(MulesoftCustomerMsService.name);
  private baseUrl: string;
  private clientId: string;

  constructor(
    private readonly authService: AuthClientService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('MULE_BASE_URL') || '';
    this.clientId = this.configService.get<string>('MULE_CLIENT_ID') || '';
  }

  async getByANI(ani: string) {
    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&mobileNumber=${ani}`;
    return this.callMule(url);
  }

  async getByDNI(dni: string) {
    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&documentType=DNI&documentNumber=${dni}`;
    return this.callMule(url);
  }

  /**
   * Método genérico para llamar a Mule con retry automático en 401
   */
  private async callMule(url: string, retryCount = 0): Promise<any> {
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
      });

      if (!response.ok) {
        // Si es 401 y es el primer intento, invalidar token y reintentar
        if (response.status === 401 && retryCount === 0) {
          this.logger.warn('Received 401, invalidating token and retrying');
          await this.authService.invalidateToken();
          return this.callMule(url, retryCount + 1);
        }

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
      this.logger.error(`Error calling Mule: ${url}`, error);
      throw error;
    }
  }
}