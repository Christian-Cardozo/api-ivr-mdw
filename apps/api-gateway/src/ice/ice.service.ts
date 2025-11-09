import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IceService {

    private readonly baseUrl: string;

    constructor(
        private readonly resilienceService: ResilienceService,
        private readonly configService: ConfigService
    ) {
        this.baseUrl = this.configService.get<string>('MULESOFT_BASE_URL') || '';
    }

    getCobros(body: any) {
        const url = `${this.baseUrl}/cobros`;

        return this.resilienceService.execute(
            `ice:cobros`,
            (signal) => this.fetchCobros(body, url, signal),
        )
    }

    async fetchCobros(body: any, url: string, signal?: AbortSignal) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
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
