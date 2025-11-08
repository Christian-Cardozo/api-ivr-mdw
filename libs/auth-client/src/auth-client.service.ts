import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '@app/redis';
import { IDPResponse } from './interfaces/idp-response.interface';
import { AuthTokenConfig } from './interfaces/auth-config.interface';


@Injectable()
export class AuthClientService {
  private readonly logger = new Logger(AuthClientService.name);  

  constructor(
    private readonly redis: RedisService,    
  ) { }

  async getToken(config: AuthTokenConfig): Promise<string> {    
    if (!config.url || !config.userkey || !config.key) {
      throw new Error('AuthClientService: Missing configuration for token retrieval');
    }
    return this.redis.getToken(config.key, () => this.fetchToken(config.url, config.userkey));
  }

  private async fetchToken(url: string, userkey: string): Promise<{ token: string; expiresIn: number }> {
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

  async invalidateToken(redisKey:string): Promise<void> {
    await this.redis.invalidateToken(redisKey);
  }
}