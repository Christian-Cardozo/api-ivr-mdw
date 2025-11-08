import { Inject, Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

type NamedClient = { name: string; client: ClientProxy };
type Timer = ReturnType<typeof setInterval>;

@Injectable()
export class MsSupervisor implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(MsSupervisor.name);
    private hbTimers = new Map<string, Timer>();

    // Inyectá todos los MS que quieras supervisar
    constructor(
        @Inject('MULESOFT_CUSTOMER_MS') private readonly mulesoftCustomerClient: ClientProxy,
        @Inject('MULESOFT_DIGITAL_BILLING_MS') private readonly mulesoftDigitalBillingClient: ClientProxy,
    ) { }

    private get clients(): NamedClient[] {
        return [
            { name: 'MULESOFT-CUSTOMER', client: this.mulesoftCustomerClient },
            { name: 'MULESOFT-DIGITAL-BILLING', client: this.mulesoftDigitalBillingClient },
            // agregá más acá
        ];
    }

    async onModuleInit() {
        await Promise.allSettled(this.clients.map(c => this.ensureConnected(c)));
        this.startHeartbeats();
    }

    onModuleDestroy() {
        for (const { name, client } of this.clients) {
            const t = this.hbTimers.get(name);
            if (t) clearInterval(t);
            client.close();
        }
        this.hbTimers.clear();
    }

    // ===== core genérico =====
    private async ensureConnected({ name, client }: NamedClient, attempt = 0): Promise<void> {
        try {
            await client.connect();
            this.logger.log(`[${name}] TCP conectado`);
        } catch (e: any) {
            const delay = Math.min(1000 * 2 ** Math.min(attempt, 5), 10000); // backoff c/ tope
            this.logger.warn(`[${name}] connect() falló: ${e?.code || e?.message}. Reintento en ${delay}ms`);
            setTimeout(() => this.ensureConnected({ name, client }, attempt + 1), delay);
        }
    }

    private startHeartbeats() {
        for (const nc of this.clients) {
            // 1 timer por cliente
            const t = setInterval(async () => {
                try {
                    const res = await firstValueFrom(
                        nc.client.send<string, string>('ping', 'ok').pipe(
                            timeout(5000),
                            catchError(() => of('err')),
                        ),
                    );
                    if (res === 'err') throw new Error('hb-timeout');
                } catch {
                    // fuerza reconnect en segundo plano
                    this.logger.warn(`[${nc.name}] heartbeat falló, forzando reconnect`);
                    // cerrar (evita sockets zombis) y reconectar
                    try { nc.client.close(); } catch { }
                    this.ensureConnected(nc).catch(() => { });
                }
            }, 15000);
            this.hbTimers.set(nc.name, t);
        }
    }
}
