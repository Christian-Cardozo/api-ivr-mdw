import { Injectable, Logger } from '@nestjs/common';
import { CircuitOpenError, NonRetryableError } from '@app/common/errors';
import {
  CircuitBreakerOptions,
  CircuitBreakerState,
  CircuitState
} from './circuit-breaker.interface';
import { CircuitBreakerStore } from './circuit-breaker.store';

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);  

  constructor(private readonly circuitStore: CircuitBreakerStore) {}

  // --- Función para obtener el estado completo (usa el store) ---
  private async getBreakerState(key: string): Promise<CircuitBreakerState> {
    return this.circuitStore.getBreakerState(key);
  }

  async execute<T>(
    key: string,
    fn: () => Promise<T>,
    config: CircuitBreakerOptions = {}
  ): Promise<T> {
    const breaker = await this.getBreakerState(key);

    const breakerConfig = {
      failureThreshold: 5,
      resetTimeoutMs: 15000,
      successThreshold: 3,
      ...config,
    }

    // Si está OPEN, rechazamos o pasamos a HALF_OPEN si venció el timeout
    if (breaker.state === 'OPEN') {
      const timeSinceFailure = Date.now() - breaker.lastStateChange;

      //Si no paso el tiempo de espera para volver a chequear si funciona
      if (timeSinceFailure < breakerConfig.resetTimeoutMs) {
        this.logger.warn(
          `🚫 [${key}] Circuito ABIERTO - Rechazando llamada (${timeSinceFailure}ms desde último cambio a OPEN)`
        );
        throw new CircuitOpenError(key);
      }

      //Si alguna replica ya esta probando si el destino responde
      if (breaker.halfOpenProbeInFlight) {
        this.logger.warn(`🚧 [${key}] HALF_OPEN probe en curso - rechazando`);
        throw new CircuitOpenError(key);
      }

      // Soy el primer proceso en intentar la probe
      const isMyProbe = await this.circuitStore.acquireHalfOpenProbeLock(key);

      if (isMyProbe) {
        this.logger.log(`🔄 [${key}] Circuito pasando a HALF_OPEN`);
        // Actualizar el estado centralmente usando el store
        await this.circuitStore.setToHalfOpen(key);
        // Continuamos la ejecución como la sonda
      } else {
        this.logger.warn(`🚧 [${key}] HALF_OPEN probe en curso (lock fallido) - rechazando`);
        throw new CircuitOpenError(key);
      }
    }

    // Si es CLOSED o logré pasar a HALF_OPEN, ejecuto la función
    try {
      const result = await fn();
      await this.onSuccess(key, breakerConfig.successThreshold);    
      return result;
    }
    catch (error) {
      const breaker = await this.getBreakerState(key);

      const isNonRetryable = error instanceof NonRetryableError;
      
      if (isNonRetryable) {
        // LÓGICA DE SANACIÓN (HEALING) PARA 4xx/400:
        // Si el error NO es reintentable (4xx/400), significa que el servicio está vivo.
        // Si estamos en HALF_OPEN, este resultado debe contar como un éxito de salud para cerrar el circuito.
        if (breaker.state === 'HALF_OPEN') {
            this.logger.log(`🔄 [${key}] 4xx/400 detectado en HALF_OPEN. Contando como éxito de salud.`);
            await this.onSuccess(key, breakerConfig.successThreshold); // Usamos onSuccess para sanar el circuito
        } 
        // Si estamos en CLOSED, no hacemos nada con los contadores.
      } else {
        // Es un error reintentable (5xx, Timeout). Contar como fallo del sistema.
        await this.onFailure(key, breakerConfig.failureThreshold); 
      }

      // Lanzamos el error original, ya sea un fallo de negocio (4xx) o un fallo de sistema (5xx)
      throw isNonRetryable ? (error.original ?? error) : error;
    }
  }

  private async onSuccess(key: string, successThreshold:number): Promise<void> {

    const breaker = await this.getBreakerState(key);

    if (breaker.state === 'HALF_OPEN') {
      // Incrementa éxitos de forma atómica
      const newSuccesses = await this.circuitStore.incrementSuccesses(key);
      
      if (newSuccesses >= successThreshold) {
        // Éxito: Pasar a CLOSED y limpiar contadores de forma atómica
        await this.circuitStore.setToClosed(key);

        this.logger.log(`✅ [${key}] Circuito CERRADO (${newSuccesses} éxitos consecutivos)`);
      }
    } else if (breaker.state === 'CLOSED') {
      // Resetear fallos al tener un éxito en CLOSED.
      // 💡 Esto es necesario para que el Circuit Breaker solo se abra ante 
      //    una secuencia de FALLOS CONSECUTIVOS. Un éxito rompe la secuencia.
      await this.circuitStore.resetFailures(key);
    }
  }

  private async onFailure(key: string, failureThreshold:number): Promise<void> {

    const breaker = await this.getBreakerState(key);

    // ⚠️ Un fallo en HALF_OPEN siempre abre el circuito y libera la sonda
    if (breaker.state === 'HALF_OPEN') {
      await this.circuitStore.setToOpen(key, true); // Pasar a OPEN y liberar lock
      this.logger.error(`🔥 [${key}] Circuito ABIERTO desde HALF_OPEN`);
      return;
    }

    // Incrementar fallos atómicamente
    const newFailures = await this.circuitStore.incrementFailures(key);
    await this.circuitStore.updateLastChange(key); // Actualizar timestamp

    // Si está en CLOSED y el umbral se alcanza
    if (newFailures >= failureThreshold) {
      await this.circuitStore.setToOpen(key, false);
      this.logger.error(`🔥 Circuito ABIERTO para ${key} (fallos consecutivos: ${newFailures})`);
    }
  }

  /**
   * Obtiene el estado actual del circuito de Redis.
   */
  async getState(key: string): Promise<CircuitState> {
    return this.circuitStore.getState(key);
  }

  /**
   * Resetea manualmente el circuito a CLOSED.
   */
  async reset(key: string): Promise<void> {
    await this.circuitStore.manualReset(key);
    this.logger.log(`🔄 [${key}] Circuito reseteado manualmente a CLOSED`);
  }
}
