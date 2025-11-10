import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OssService {

    private readonly baseUrl: string;    

    constructor(
        private readonly resilienceService: ResilienceService,
        private readonly configService: ConfigService,
    ) {
        this.baseUrl = this.configService.get<string>("OSS_BASE_URL") || "";
     }

    async getEventToKafka(body: any) {
        const url = `${this.baseUrl}`;

        return this.resilienceService.execute(
            `oss:eventos`,
            (signal) => this.fetchService(body, url, signal),
        )
    }

    async fetchService(body: any, url: string, signal?: AbortSignal) {
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
