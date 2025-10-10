import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@app/redis';
import { IDPResponse } from './interfaces/idp-response.interface';

@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);
  private readonly TOKEN_KEY = 'idp:mule:token';

  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Obtiene el token (de cache o renovado)
   */
  async getToken(): Promise<string> {
    return this.redis.getToken(this.TOKEN_KEY, () => this.fetchToken());
  }

  /**
   * Llama al IDP para obtener un nuevo token
   */
  private async fetchToken(): Promise<{ token: string; expiresIn: number }> {
    const url = this.config.get<string>('IDP_URL') || '';
    const userkey = this.config.get<string>('IDP_USERKEY') || '';
    const auth = 'Basic ' + Buffer.from(userkey).toString('base64');

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error fetching token: ' + response.statusText);
      }

      const data: IDPResponse = await response.json();

      return {
        token: data.access_token,
        expiresIn: data.expires_in || 3600,
      };
    } catch (error) {
      this.logger.error('Failed to fetch token from IDP', error);
      throw error;
    }
  }

  /**
   * Invalida el token (útil cuando recibes 401)
   */
  async invalidateToken(): Promise<void> {
    await this.redis.invalidateToken(this.TOKEN_KEY);
  }
}