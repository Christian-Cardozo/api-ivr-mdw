import { Injectable, Logger, RequestTimeoutException } from '@nestjs/common';

export interface RetryConfig {
    maxRetries?: number; // Número de reintentos
    retryDelayMs?: number; // Retardo entre reintentos en milisegundos
    timeoutMs?: number; // Tiempo máximo de espera para la operación en milisegundos
    retryOn?: (error: any) => boolean; // Función para determinar si se debe reintentar según el error
}

@Injectable()
export class ResilienceService {

    private readonly logger = new Logger(ResilienceService.name);

    /**
    * Executes an asynchronous function with retry logic.
    * (Ejecuta una función asíncrona con reintentos configurables)
    *
    * @template T - Return type of the async function.
    * @param {string} key - Unique identifier (for logging or distributed locks).
    * @param {() => Promise<T>} fn - Async function to execute.
    * @param {RetryConfig} [config={}] - Optional retry settings (max attempts, delay, backoff, etc.).
    * @returns {Promise<T>} Resolves with the result of `fn` when successful.
    * @throws {Error} If all retry attempts fail.
    *
    * @example
    * await execWithRetry('fetchUser', () => api.getUser(id), { retries: 3, delay: 500 });
    */
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
                    throw error;
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

    /**
    * Executes an asynchronous function with a timeout, using an AbortController for cooperative cancellation.
    * (Ejecuta una función asíncrona con un tiempo de espera límite, utilizando AbortController
    * para la cancelación cooperativa.)
    *
    * IMPORTANT: The provided function 'fn' MUST respect the AbortSignal to ensure the timeout works correctly.
    * (IMPORTANTE: La función 'fn' provista DEBE respetar la AbortSignal para asegurar que el timeout funcione correctamente.)
    *
    * @template T - Return type of the async function.
    * @param {(signal?: AbortSignal) => Promise<T>} fn - The asynchronous function to execute, which accepts an optional AbortSignal.
    * @param {number} timeoutMs - The maximum time in milliseconds to wait for the function to complete.
    * @param {AbortController} controller - The AbortController managing the operation's signal.
    * @returns {Promise<T>} Resolves with the result of 'fn'.
    * @throws {RequestTimeoutException} If the timeout is reached and the signal is aborted.
    * @throws {Error} If the operation fails for any other reason.
    */
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
