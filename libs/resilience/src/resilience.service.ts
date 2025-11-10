import { HttpException, Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { CircuitBreakerService } from './circuit-breaker/circuit-breaker.service';
import { NonRetryableError } from '@app/common/errors';
import { ResilienceConfig } from './resilience.interface';

@Injectable()
export class ResilienceService {

    private readonly logger = new Logger(ResilienceService.name);

    constructor(private readonly circuitBreakerService: CircuitBreakerService) { }

    async execute<T>(
        key: string,
        fn: (signal?: AbortSignal) => Promise<T>,
        config: ResilienceConfig = {}
    ): Promise<T> {

        if (config.circuitBreakerEnabled) {
            return this.circuitBreakerService.execute(key, () => this.executeWithRetry(key, fn, config));
        }
        else {
            return this.executeWithRetry(key, fn, config);
        }
    }


    async executeWithRetry<T>(
        key: string,
        fn: (signal?: AbortSignal) => Promise<T>,
        config: ResilienceConfig = {}
    ): Promise<T> {

        const {
            maxRetries = 3,
            retryDelayMs = 1000,
            timeoutMs = 5000,
            retryOn = this.defaultRetryOn
        } = config;

        //console.log({ maxRetries, retryDelayMs, timeoutMs });

        let lastError: Error;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {

                const controller = new AbortController();

                const result = await this.executeWithTimeout(fn, timeoutMs, controller);

                if (attempt > 0) {
                    this.logger.log(`✅ Éxito en intento ${attempt}/${maxRetries} para ${key}`);
                }

                return result;
            }
            catch (error) {

                lastError = error as Error;

                if (!retryOn(error)) {
                    this.logger.warn(`❌ Error no reintentable para ${key}`);
                    if (error instanceof HttpException || error?.getStatus?.()) {
                        throw error;
                    }
                    
                    throw new NonRetryableError(error);
                }

                if (attempt === maxRetries) {
                    this.logger.error(`❌ Falló después de ${attempt} intentos para ${key}`, error);
                    throw error;
                }

                const baseDelay = retryDelayMs * Math.pow(2, attempt);
                // Jitter: Retraso aleatorio entre 0 y el valor del backoff exponencial
                const delay = Math.round(Math.random() * baseDelay);

                this.logger.warn(`⚠️ Intento ${attempt}/${maxRetries} falló para ${key}, reason: ${lastError.message} | Reintentando en ${delay}ms...`);
                await this.sleep(delay);
            }
        }

        throw lastError!;
    }

    private async executeWithTimeout<T>(
        fn: (signal?: AbortSignal) => Promise<T>,
        timeoutMs: number,
        controller: AbortController,
    ): Promise<T> {
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fn(controller.signal);
        } catch (err: unknown) {
            // Si fue por abort, lo convertimos en RequestTimeoutException
            if (controller.signal.aborted) {
                throw new RequestTimeoutException(`Timeout después de ${timeoutMs}ms`);
            }
            throw err;
        } finally {
            clearTimeout(timer);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    private readonly defaultRetryOn = (error: any): boolean => {
        // No reintentar errores del cliente (4xx)
        if (error?.status >= 400 && error?.status < 500) {
            return false;
        }
        // Sí reintentar 5xx, timeouts, y errores de red
        return true;
    };
}
