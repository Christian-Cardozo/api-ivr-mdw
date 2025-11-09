import { AuthClientService } from '@app/auth-client';
import { AuthTokenConfig } from '@app/auth-client/interfaces/auth-config.interface';
import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ResponsysService {

    private readonly baseUrl: string;
    private readonly authConfig: AuthTokenConfig;

    constructor(
        private readonly resilienceService: ResilienceService,
        private readonly configService: ConfigService,
        private readonly authService: AuthClientService,
    ) {
        this.baseUrl = this.configService.get<string>("RESPONSYS_BASE_URL") || "";
        this.authConfig = {
            key: `idp:responsys:token`,
            url: this.configService.get<string>("RESPONSYS_AUTH_URL") || "",
            userkey: this.configService.get<string>("RESPONSYS_AUTH_USERKEY") || "",
        }
    }

    async sendRap(body: any) {
        const url = `${this.baseUrl}/rap/send`;

        return this.resilienceService.execute(
            `responsys:rap`,
            (signal) => this.fetchService(body, url, signal),
        )
    }

    async fetchService(body: any, url: string, signal?: AbortSignal) {
        const token = this.authService.getToken(this.authConfig)
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            signal
        })

        if (!response.ok) {
            const txt = await response.text();
            throw new HttpException(txt || 'Upstream error', response.status);
        }

        return await response.json();
    }
}
