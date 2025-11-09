import { AuthClientService } from '@app/auth-client';
import { AuthTokenConfig } from '@app/auth-client/interfaces/auth-config.interface';
import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SalesforceService {

    private readonly baseUrl: string;
    private readonly authConfig: AuthTokenConfig;

    constructor(
        private readonly authService: AuthClientService,
        private readonly resilienceService: ResilienceService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>("SALESFORCE_BASE_URL") || "";

        this.authConfig = {
            key: 'saleforce:token',
            userkey: '',
            url: this.configService.get<string>("SALESFORCE_AUTH_URL") || ""
        }
    }

    async getProductOffering(body: any) {
        const url = `${this.baseUrl}/tmf-api/productOfferingQualification/v4/productOfferingQualification/additional/`;

        return this.resilienceService.execute(
            `salesforce:products`,
            (signal) => this.fetchService(body, url, signal),
        )
    }

    async getIntegrationProcedure(body: any) {
        const url = `${this.baseUrl}/vlocity_cmt/v1/integrationprocedure/IFS_S634`;

        return this.resilienceService.execute(
            `salesforce:robo`,
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
