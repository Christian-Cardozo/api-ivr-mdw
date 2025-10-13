import { Logger } from '@nestjs/common';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;  // cuántos fallos seguidos abren el circuito
  resetTimeoutMs?: number;    // cuánto tiempo queda en OPEN antes de probar de nuevo
}

interface CircuitBreakerState {
  failures: number;
  state: CircuitState;
  lastFailureTime: number;
}

export class CircuitBreaker {
  private readonly logger = new Logger(CircuitBreaker.name);
  private readonly breakers = new Map<string, CircuitBreakerState>();
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;

  constructor(options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 3;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 15000;
  }

  async execute<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const breaker = this.getBreaker(key);

    //console.log(breaker)
    // Si está OPEN, rechazamos o pasamos a HALF_OPEN si venció el timeout
    if (breaker.state === 'OPEN') {
      const since = Date.now() - breaker.lastFailureTime;
      if (since < this.resetTimeoutMs) {
        this.logger.warn(`🚫 Circuito abierto para ${key}, rechazando llamada.`);
        throw new Error(`Circuit breaker OPEN for ${key}`);
      }
      this.logger.log(`🔄 Circuito HALF_OPEN para ${key}`);
      breaker.state = 'HALF_OPEN';
    }

    try {
      const result = await fn();
      this.onSuccess(breaker, key);
      return result;
    } catch (error) {
      this.onFailure(breaker, key);
      throw error;
    }
  }

  private onSuccess(breaker: CircuitBreakerState, key: string) {
    if (breaker.state !== 'CLOSED') {
      this.logger.log(`✅ Circuito restablecido para ${key}`);
    }
    breaker.failures = 0;
    breaker.state = 'CLOSED';
  }

  private onFailure(breaker: CircuitBreakerState, key: string) {
    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    if (breaker.failures >= this.failureThreshold) {
      breaker.state = 'OPEN';
      this.logger.error(`🔥 Circuito abierto para ${key} (fallos consecutivos: ${breaker.failures})`);
    }
  }

  private getBreaker(key: string): CircuitBreakerState {
    if (!this.breakers.has(key)) {
      this.breakers.set(key, { failures: 0, state: 'CLOSED', lastFailureTime: 0 });
    }
    return this.breakers.get(key)!;
  }
}
