import { AuthClientService } from '@app/auth-client';
import { ResilienceService } from '@app/resilience';
import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import https from 'https';
import { AuthTokenConfig } from '@app/auth-client/interfaces/auth-config.interface';

@Injectable()
export class XscaleService {

    private readonly baseUrl: string;
    private readonly clientId: string;
    private readonly tranbUrl: string;
    private readonly outageUrl: string;
    private readonly outageClientId: string;
    private readonly authTokenConfig: AuthTokenConfig;

    constructor(
        private readonly configService: ConfigService,
        private readonly resilienceService: ResilienceService,
        private readonly authService: AuthClientService,
    ) {
        this.authTokenConfig = {
            url: this.configService.get<string>('XSCALE_AUTH_TOKEN_URL') || '',
            userkey: this.configService.get<string>('XSCALE_AUTH_USERKEY') || '',
            key: 'idp:3scale:token',
            kind: 'id_token',
        };

        this.baseUrl = this.configService.get<string>('XSCALE_BASE_URL') || "";
        this.clientId = this.configService.get<string>('XSCALE_CLIENT_ID') || "";
        this.tranbUrl = this.configService.get<string>('XSCALE_TRANB_URL') || "";
        this.outageUrl = this.configService.get<string>('XSCALE_OUTAGE_URL') || "";
        this.outageClientId = this.configService.get<string>('XSCALE_OUTAGE_CLIENT_ID') || "";
    }

    getOutageManagerStatus(ani: string): Promise<any> {
        const url = `${this.outageUrl}/oum/api/outages/ani/${ani}`;

        return this.resilienceService.execute(
            'mule:outage',
            (signal) => this.fetchOutageManagerStatus(url, signal),
        )
    }

    async fetchOutageManagerStatus(url: string, signal?: AbortSignal): Promise<any> {
        const authConfig: AuthTokenConfig = {
            url: this.outageUrl,
            key: 'idp:3scale-outage:token',
            userkey: this.outageClientId
        }
        const token = await this.authService.getToken(authConfig);
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            client_id: this.outageClientId.split(':')[0],
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

    async getPaymentCoupons(type: string, dni: string): Promise<any> {
        const url = `${this.baseUrl}/paymentManagement/paymentsOnline/coupons?countryId=1&documentType=${type}&documentNumber=${dni}`;

        return this.resilienceService.execute(
            'mule:coupons',
            (signal) => this.fetchService(url, signal),
        )
    }

    async getBillingInvoices(suscriptionId: string): Promise<any> {
        const url = `${this.baseUrl}/billingManagement/invoices/?subscriptionId=${suscriptionId}&quantity=10`;

        return this.resilienceService.execute(
            'mule:invoices',
            (signal) => this.fetchService(url, signal),
            {
                maxRetries: 1,
            }
        )
    }

    async getCustomerSubscribers(type: string, cuic: string): Promise<any> {
        const url = `${this.baseUrl}/customerManagement/subscribers/?cuic=${cuic}&identTypeId=${type}`;

        return this.resilienceService.execute(
            'mule:subscribers',
            (signal) => this.fetchService(url, signal),
            {
                maxRetries: 1,
            }
        )
    }

    async fetchService(url: string, signal?: AbortSignal): Promise<any> {
        const token = await this.authService.getToken(this.authTokenConfig);
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            client_id: this.clientId,
        };

        const agent = new https.Agent({ rejectUnauthorized: false });

        const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            agent,
            signal
        })

        if (!response.ok) {
            const txt = await response.text();
            throw new HttpException(txt || 'Upstream error', response.status);
        }

        return await response.json();
    }

    async getPayment(body: any): Promise<any> {
        const url = `${this.baseUrl}/paymentManagement/retrocompatible/makeAPayment`;

        return this.resilienceService.execute(
            'mule:make-payment',
            (signal) => this.fetchPayment(body, url, signal),
            {
                maxRetries: 1,
            }
        )
    }

    async fetchPayment(body: any, url: string, signal?: AbortSignal): Promise<any> {
        const token = await this.authService.getToken(this.authTokenConfig);
        const headers: Record<string, string> = {
            'Content-Type': 'text/xml',
            Authorization: `Bearer ${token}`,
            client_id: this.clientId,
        };

        const {
            EBMID,
            SubscriberID,
            Contract,
            Company,
            IdentificationType,
            IdentificationNumber,
            Amount,
            CreditCardNumber,
            CreditCardExpirationDate,
            CreditCardSecurityCode
        } = body;

        const xmlPayload = `<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:v1="http://xmlns.cablevision.com.ar/EnterpriseObjects/IVR/ABM/Pago/V1/" xmlns:v11="http://xmlns.cablevision.com.ar/EnterpriseObjects/Common/EBM/Ebm/V1/">
        <SOAP-ENV:Header/>
        <SOAP-ENV:Body>
        <v1:RegistrarPagoABM>
        	<v11:EBMHeader>
        		<v11:EBMID>${EBMID}</v11:EBMID>
        	</v11:EBMHeader>
        		<v1:DataArea>
        			<v1:ClientID>
        				<v1:SubscriberID>${SubscriberID}</v1:SubscriberID>
        				<v1:Contract>${Contract}</v1:Contract>
        				<v1:Company>${Company}</v1:Company>
        				<v1:IdentificationType>${IdentificationType}</v1:IdentificationType>
        				<v1:IdentificationNumber>${IdentificationNumber}</v1:IdentificationNumber>
        			</v1:ClientID>
        		<v1:Amount>${Amount}</v1:Amount>
        		<v1:CreditCardNumber>${CreditCardNumber}</v1:CreditCardNumber>
        		<v1:CreditCardExpirationDate>${CreditCardExpirationDate}</v1:CreditCardExpirationDate>
        		<v1:CreditCardSecurityCode>${CreditCardSecurityCode}</v1:CreditCardSecurityCode>
        		</v1:DataArea>
        </v1:RegistrarPagoABM>
        </SOAP-ENV:Body>
        </SOAP-ENV:Envelope>`;

        //console.log('Fetching billing invoices from URL:', url);
        //console.log('Using headers:', headers);
        console.log('XML Payload:', xmlPayload);
        const agent = new https.Agent({ rejectUnauthorized: false });

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: xmlPayload,
            agent,
            signal
        })

        if (!response.ok) {
            const txt = await response.text();
            throw new HttpException(txt || 'Upstream error', response.status);
        }

        return await response.json();
    }

    async getTranB(ani: string): Promise<any> {
        const url = `${this.tranbUrl}/obtenerCYS_REST/obtenerCYS/`;

        return this.resilienceService.execute(
            'mule:tranb',
            (signal) => this.fetchTranB(ani, url, signal),
            {
                maxRetries: 1,
            }
        )
    }

    async fetchTranB(ani: string, url: string, signal?: AbortSignal): Promise<any> {
        const token = await this.authService.getToken(this.authTokenConfig);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            user_key: this.clientId,
        };

        const body = {
            nroLinea: ani,
            codOperacion: 3
        };

        const agent = new https.Agent({ rejectUnauthorized: false });

        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
            agent,
            signal
        })

        if (!response.ok) {
            const txt = await response.text();
            throw new HttpException(txt || 'Upstream error', response.status);
        }

        return await response.json();
    }
}
