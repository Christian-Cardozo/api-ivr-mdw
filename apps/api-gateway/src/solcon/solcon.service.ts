import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SolconService {

    private readonly baseUrl: string;
    private readonly apiKey: string;

    constructor(
        private readonly resilienceService: ResilienceService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>("SOLCON_BASE_URL") || "";
        this.apiKey = this.configService.get<string>("SOLCON_API_KEY") || "";
    }

    async getContextStoreCreate(body: any) {
        const url = `${this.baseUrl}/context-store/create-context`;

        return this.resilienceService.execute(
            `solcon:context-store`,
            (signal) => this.fetchService(body, url, signal),
        )
    }

    async fetchService(body: any, url: string, signal?: AbortSignal) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'x-concierge-key': `${this.apiKey}`
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
