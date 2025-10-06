import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthClientService {

    async getToken(): Promise<string> {

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
        return data.access_token;
    }
}
