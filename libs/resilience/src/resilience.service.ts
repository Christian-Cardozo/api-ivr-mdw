import { Injectable, Logger, RequestTimeoutException } from '@nestjs/common';

export interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  state: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
}

export interface RetryConfig {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
  circuitBreaker?: boolean;
}

@Injectable()
export class ResilienceService {
  private readonly logger = new Logger(ResilienceService.name);
  private circuitBreakers = new Map<string, CircuitBreakerState>();

  // Configuración por defecto
  private readonly FAILURE_THRESHOLD = 5; // 5 fallos para abrir circuito
  private readonly RESET_TIMEOUT = 60000; // 60 segundos en estado OPEN
  private readonly HALF_OPEN_MAX_CALLS = 3; // Llamadas en HALF_OPEN

  /**
   * Ejecuta una función con timeout, reintentos y circuit breaker
   */
  async executeWithResilience<T>(
    key: string,
    fn: () => Promise<T>,
    config: RetryConfig = {},
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      timeout = 10000,
      circuitBreaker = true,
    } = config;

    // 1. Verificar circuit breaker
    if (circuitBreaker && this.isCircuitOpen(key)) {
      throw new Error(`Circuit breaker OPEN para ${key}`);
    }

    // 2. Ejecutar con reintentos
    let lastError: Error;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Ejecutar con timeout
        const result = await this.executeWithTimeout(fn, timeout);

        // Marcar éxito en circuit breaker
        if (circuitBreaker) {
          this.recordSuccess(key);
        }

        if (attempt > 0) {
          this.logger.log(`✅ Éxito en intento ${attempt + 1}/${maxRetries + 1} para ${key}`);
        }

        return result;
      } catch (error) {
        lastError = error;

        // Marcar fallo en circuit breaker
        if (circuitBreaker) {
          this.recordFailure(key);
        }

        // Si es el último intento, lanzar error
        if (attempt === maxRetries) {
          this.logger.error(
            `❌ Falló después de ${maxRetries + 1} intentos para ${key}`,
            error,
          );
          throw error;
        }

        // Log de reintento
        this.logger.warn(
          `⚠️ Intento ${attempt + 1}/${maxRetries + 1} falló para ${key}, reintentando en ${retryDelay}ms...`,
        );

        // Esperar antes de reintentar (con backoff exponencial)
        const delay = retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * Ejecuta con timeout usando AbortController
   */
  private async executeWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number,
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new RequestTimeoutException(`Timeout después de ${timeoutMs}ms`)),
          timeoutMs,
        ),
      ),
    ]);
  }

  /**
   * Verifica si el circuit breaker está abierto
   */
  private isCircuitOpen(key: string): boolean {
    const state = this.circuitBreakers.get(key);
    if (!state || state.state === 'CLOSED') {
      return false;
    }

    const now = Date.now();

    // Si está OPEN, verificar si pasó el tiempo de reset
    if (state.state === 'OPEN') {
      if (now - state.lastFailureTime > this.RESET_TIMEOUT) {
        this.logger.log(`🔓 Circuit breaker ${key}: OPEN → HALF_OPEN`);
        state.state = 'HALF_OPEN';
        state.failures = 0;
        return false;
      }
      this.logger.warn(`⛔ Circuit breaker ${key} está OPEN`);
      return true;
    }

    // HALF_OPEN: permitir algunas llamadas de prueba
    return false;
  }

  /**
   * Registra un fallo en el circuit breaker
   */
  private recordFailure(key: string): void {
    let state = this.circuitBreakers.get(key);

    if (!state) {
      state = { failures: 0, lastFailureTime: Date.now(), state: 'CLOSED' };
      this.circuitBreakers.set(key, state);
    }

    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.failures >= this.FAILURE_THRESHOLD) {
      state.state = 'OPEN';
      this.logger.error(
        `🔴 Circuit breaker ${key}: CERRADO → ABIERTO (${state.failures} fallos)`,
      );
    } else {
      this.logger.warn(
        `⚠️ Fallo ${state.failures}/${this.FAILURE_THRESHOLD} para ${key}`,
      );
    }
  }

  /**
   * Registra un éxito en el circuit breaker
   */
  private recordSuccess(key: string): void {
    const state = this.circuitBreakers.get(key);

    if (!state) {
      return;
    }

    if (state.state === 'HALF_OPEN') {
      this.logger.log(`🟢 Circuit breaker ${key}: HALF_OPEN → CERRADO`);
      state.state = 'CLOSED';
      state.failures = 0;
    } else if (state.failures > 0) {
      // Resetear contador de fallos gradualmente
      state.failures = Math.max(0, state.failures - 1);
    }
  }

  /**
   * Obtiene el estado del circuit breaker
   */
  getCircuitBreakerState(key: string): CircuitBreakerState | undefined {
    return this.circuitBreakers.get(key);
  }

  /**
   * Resetea manualmente un circuit breaker
   */
  resetCircuitBreaker(key: string): void {
    this.circuitBreakers.delete(key);
    this.logger.log(`🔄 Circuit breaker ${key} reseteado manualmente`);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
