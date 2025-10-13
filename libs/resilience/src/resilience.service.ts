import { Injectable, Logger, RequestTimeoutException } from '@nestjs/common';
import { CircuitBreaker } from './circuit-breaker';
import { NonRetryableError } from 'libs/common/errors';

export interface RetryConfig {
    maxRetries?: number; // Número de reintentos
    retryDelayMs?: number; // Retardo entre reintentos en milisegundos
    timeoutMs?: number; // Tiempo máximo de espera para la operación en milisegundos
    retryOn?: (error: any) => boolean; // Función para determinar si se debe reintentar según el error
}

@Injectable()
export class ResilienceService {

    private readonly logger = new Logger(ResilienceService.name);
    private readonly breaker = new CircuitBreaker({ failureThreshold: 3, resetTimeoutMs: 15000 });

    async execute<T>(
        key: string,
        fn: (signal?: AbortSignal) => Promise<T>,
        config: RetryConfig = {}
    ): Promise<T> {
        return this.breaker.execute(key, () => this.executeWithRetry(key, fn, config));
    }


    async executeWithRetry<T>(
        key: string,
        fn: (signal?: AbortSignal) => Promise<T>,
        config: RetryConfig = {}
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
                    throw new NonRetryableError(error);
                }

                if (attempt === maxRetries) {
                    this.logger.error(`❌ Falló después de ${attempt} intentos para ${key}`, error);
                    throw error;
                }

                const baseDelay = retryDelayMs * Math.pow(2, attempt);
                // Jitter: Retraso aleatorio entre 0 y el valor del backoff exponencial
                const delay = Math.round(Math.random() * baseDelay);

                this.logger.warn(`⚠️ Intento ${attempt}/${maxRetries} falló para ${key}, reintentando en ${delay}ms...`);
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
