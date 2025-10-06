import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { IDPResponse } from './interfaces/idp-response.interface';
import type { Cache } from 'cache-manager';


@Injectable()
export class AuthClientService {

    constructor(@Inject(CACHE_MANAGER) private cache: Cache) { }

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

        const url = 'https://idpsesion.telecom.com.ar/openam/oauth2/access_token?realm=/convergente&grant_type=client_credentials&scope=openid';
        const userkey = '67472340-c6fc-4345-b266-d082f1cbbfd6:Sp_VEuev5DsGcP1c30fxVPOaErhfJsYzPFpUrrRuu9bRlK1jLBVzNrbJnk1YKM2sd2QkddxwW5xT50iF5PhcfA';
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
