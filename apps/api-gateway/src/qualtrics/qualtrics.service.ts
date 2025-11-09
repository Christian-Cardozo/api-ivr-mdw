import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QualtricsService {

    private readonly baseUrl: string;
    private readonly listUrl: Record<string, string> = {
        '150': '/triggers?contextId=OC_SPltIb7LrjONy6d&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_SPltIb7LrjONy6d',
        '151Sos': '/triggers?contextId=OC_25LcgGDZXD7YlMC&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_25LcgGDZXD7YlMC',
        '151RecaTC': '/triggers?urlTokenId=909c245f-e3e4-48e6-8d05-1b5c18e2ca33',
        '152': '/triggers?contextId=OC_2CqDYlUive9kgVk&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_2CqDYlUive9kgVk',
        PromesaPago_Movil: '/triggers?contextId=OC_2v1h5cahoudEV53&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_2v1h5cahoudEV53',
        PromesaPago_Hogar: '/triggers?contextId=OC_3h3GABRiwQ4D6nP&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_3h3GABRiwQ4D6nP',
        Saldo_Movil: '/triggers?contextId=OC_2ruAH3cyZgeb6dc&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_2ruAH3cyZgeb6dc',
        Saldo_Hogar: '/triggers?contextId=OC_3F3SpyPMegWKwdU&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_3F3SpyPMegWKwdU',
        PagoTC_Movil: '/triggers?contextId=OC_9YzlOKsFV2f274d&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_9YzlOKsFV2f274d',
        PagoTC_Hogar: '/triggers?contextId=OC_Um4Wg8IYq2l6lwd&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_Um4Wg8IYq2l6lwd',
        Unidades: '/triggers?contextId=OC_1pxSthlZajvRIs5&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_1pxSthlZajvRIs5',
        AumentoMapl: '/triggers?urlTokenId=91d76e0b-0c78-486f-9ac2-89cb4f2b7899',
        AumentoMcons: '/triggers?urlTokenId=251b9298-7e11-41b5-ac0a-bcfc320e7278',
        AumentoHapl: '/triggers?urlTokenId=628adba7-2f9b-4d22-b437-b29ab29ce117',
        AumentoHcons: '/triggers?urlTokenId=ff4191b1-052c-4baf-9ae3-f6b5a72c2531',
        ConsultaAgenda: '/triggers?urlTokenId=79de8729-d805-48e1-8e9c-e296efae97a0',
        Outage: '/triggers?urlTokenId=f0fc75da-9313-443f-9d7d-fc1e8aa2527b',
        Recalculo: '/triggers?urlTokenId=30622d35-668c-496f-956e-699f3982d8fb',
        PacksSOS: '/triggers?contextId=OC_8wilrzLMCCBD5ac&userId=UR_0fuLxHHxUQxoMwl&brandId=telecom&triggerId=OC_8wilrzLMCCBD5ac',
    };

    constructor(
        private readonly resilienceService: ResilienceService,
        private readonly configService: ConfigService,
    ) { 
        this.baseUrl = this.configService.get<string>("QUALTRICS_BASE_URL") || "";
    }

    async sendSurvey(key: string, body: any) {
        const url = `${this.baseUrl}${this.listUrl[key]}`;

        return this.resilienceService.execute(
            `qualtrics:key`,
            (signal) => this.fetchService(body, url, signal),
        )
    }

    async fetchService(body: any, url: string, signal?: AbortSignal) {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'X-API-TOKEN': `IB4Jx4JERGBluWgZ3PLpwr7fwFRA9wABahi2MnSM`
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
