import { AuthClientService } from '@app/auth-client';
import { AuthTokenConfig } from '@app/auth-client/interfaces/auth-config.interface';
import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';

@Injectable()
export class CustomerCareService {

    private readonly baseUrl: string;    

    constructor(        
        private readonly resilienceService: ResilienceService,
    ) { }

    async getServiceAdapter(body: any, code: string) {

        const url = `${this.baseUrl}/ccc-service-adapter-${code}/service`;

        return this.resilienceService.execute(
            `ccc:adapter-${code}`,
            (signal) => this.fetchServiceAdapter(body, url, signal),
        )

    }

    async fetchServiceAdapter(body: any, url: string, signal?: AbortSignal) {        
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

    async getIvrCobranzas(dni: string) {
        const url = `${this.baseUrl}/cc-ivr-cobranzas/service/${dni}/?metodo=0800COBRANZA`;

        return this.resilienceService.execute(
            'ccc:cobranzas',
            (signal) => this.fetchService(url, signal),
        )
    }

    async getIvrDelivery(dni: string) {
        const url = `${this.baseUrl}/cc-ivr-delivery/delivery?dni=${dni}`;

        return this.resilienceService.execute(
            'ccc:delivery',
            (signal) => this.fetchService(url, signal),
        )
    }

    async getIvrJuridical(personId: string, params: any) {
        const { ani } = params;
        const url = `${this.baseUrl}/cc-ivr-juridical/service/${personId}/?ani=${ani}`;

        return this.resilienceService.execute(
            'ccc:juridical',
            (signal) => this.fetchService(url, signal),
        )
    }

    async getIvrJuridicalInfo(cuit: string) {
        const url = `${this.baseUrl}/cc-ivr-juridical/cliente/${cuit}`;

        return this.resilienceService.execute(
            'ccc:juridical-info',
            (signal) => this.fetchService(url, signal),
        )
    }

    async getIvrPacks(dni: string) {
        const url = `${this.baseUrl}/cc-ivr-packs/service/${dni}`;

        return this.resilienceService.execute(
            'ccc:packs',
            (signal) => this.fetchService(url, signal),
        )
    }

    async getIvrSoho(num: string) {
        const url = `${this.baseUrl}/ccc-ivr-soho/service/soho/${num}`;

        return this.resilienceService.execute(
            'ccc:soho',
            (signal) => this.fetchService(url, signal),
        )
    }

    async getCSPFront(dni?: string, ani?: string) {
        
        let url:string;

        if(dni){
            url = `${this.baseUrl}/ccc-csp-front/service/${dni}/?ani=${ani}`;
        }
        else{
            url = `${this.baseUrl}/ccc-csp-front/service/-?ani=${ani}`;
        }

        return this.resilienceService.execute(
            'ccc:csp-front',
            (signal) => this.fetchService(url, signal),
        )
    }

    async fetchService(url: string, signal?: AbortSignal) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',                        
        };

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            signal
        })

        if (!response.ok) {
            const txt = await response.text();
            throw new HttpException(txt || 'Upstream error', response.status);
        }

        return await response.json();
    }

    async getCSCPersistencia(body: any) {

        const url = `${this.baseUrl}/ccc-csp-persistencia/service/suceso`;

        return this.resilienceService.execute(
            `ccc:csp-persistencia`,
            (signal) => this.fetchCSCPersistencia(body, url, signal),
        )

    }

    async fetchCSCPersistencia(body: any, url: string, signal?: AbortSignal) {

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'cc-auth': `authorization 5yk0ru2rb821jlxi9xic8huch1yitbna`,
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
