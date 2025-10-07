import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { IDPResponse } from './interfaces/idp-response.interface';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthClientService {

    constructor(
        @Inject(CACHE_MANAGER) private cache: Cache,
        private readonly configService: ConfigService,
    ) { }

    async getToken(): Promise<string> {
       
        const cachedToken = await this.cache.get<string>('auth_token');
        if (cachedToken) {            
            return cachedToken;
        }

        const tokenData: IDPResponse = await this.fetchToken(); // tu POST al IdP (con fetch)
        const token = tokenData.access_token;
        const ttl = Math.max(30, (tokenData.expires_in ?? 300) - 30); // skew 30s

        await this.cache.set('auth_token', token, ttl * 1000);
        return token;
    }

    async fetchToken(): Promise<IDPResponse> {

        const url = this.configService.get<string>('IDP_URL') || '';
        const userkey = this.configService.get<string>('IDP_USERKEY') || '';
        const auth = 'Basic ' + Buffer.from(userkey).toString('base64');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': auth,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Error fetching token: ' + response.statusText);
        }
        const data = await response.json();
        return data;
    }
}
