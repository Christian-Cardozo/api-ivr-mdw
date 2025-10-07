import { AuthClientService } from '@app/auth-client';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MulesoftCustomerMsService {

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
    
    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&mobileNumber=${ani}`
    const client = this.clientId
    const token = await this.authService.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'client_id': `${client}`,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(
        { message: txt || 'Upstream error', statusText: response.statusText },
        response.status,
      );

    }

    return response.json();
  }

  async getByDNI(dni: string) {

    const url = `${this.baseUrl}/api/v1/customer?excludeNulls=true&deepLevel=3&documentType=DNI&documentNumber=${dni}`
    const client = this.clientId;
    const token = await this.authService.getToken();;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'client_id': `${client}`,
    };

    const response = await fetch(url, {
      method: 'GET',
      headers: headers,
    })

    if (!response.ok) {
      const txt = await response.text();
      throw new HttpException(txt || 'Upstream error', response.status);
    }

    return response.json();
  }
}
