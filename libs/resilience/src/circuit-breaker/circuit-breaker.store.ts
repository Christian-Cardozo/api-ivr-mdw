import { Injectable, Logger } from '@nestjs/common';
import type Redis from 'ioredis';
import { RedisService } from '@app/redis/redis.service';
import { CircuitBreakerState, CircuitState } from './circuit-breaker.interface'; 

// --- Definición de Claves de Redis ---
const KEY_PREFIX = 'cb';
const STATE_KEY = (key: string) => `${KEY_PREFIX}:${key}:state`;
const FAILURES_KEY = (key: string) => `${KEY_PREFIX}:${key}:failures`;
const LAST_CHANGE_KEY = (key: string) => `${KEY_PREFIX}:${key}:last_change`;
const SUCCESSES_KEY = (key: string) => `${KEY_PREFIX}:${key}:successes`;
const HALF_OPEN_PROBE_LOCK_KEY = (key: string) => `${KEY_PREFIX}:${key}:probe_lock`;
const HALF_OPEN_PROBE_LOCK_TTL_MS = 10000;

@Injectable()
export class CircuitBreakerStore {
  private readonly logger = new Logger(CircuitBreakerStore.name);
  private readonly redisClient: Redis;

  constructor(private readonly redisService: RedisService) {
    // Obtenemos el cliente ioredis subyacente para comandos atómicos
    this.redisClient = this.redisService.getRedisClient(); 
  }

  /**
   * Obtiene el estado completo de un disyuntor desde Redis.
   */
  async getBreakerState(key: string): Promise<CircuitBreakerState> {
    const [
      state,
      failures,
      lastChange,
      successes,
      probeLock,
    ] = await this.redisClient.mget(
      STATE_KEY(key),
      FAILURES_KEY(key),
      LAST_CHANGE_KEY(key),
      SUCCESSES_KEY(key),
      HALF_OPEN_PROBE_LOCK_KEY(key),
    );

    // Si el estado no existe, asumimos CLOSED
    const currentState: CircuitState = (state as CircuitState) || 'CLOSED';

    return {
      state: currentState,
      failures: parseInt(failures || '0', 10),
      successes: parseInt(successes || '0', 10),
      lastStateChange: parseInt(lastChange || '0', 10),
      // Si el lock existe, una sonda está en vuelo.
      halfOpenProbeInFlight: !!probeLock,
      lastFailureTime: 0, // No se usa en la lógica distribuida
    };
  }
  
  /**
   * Intenta adquirir el lock de la sonda HALF_OPEN de forma atómica.
   */
  async acquireHalfOpenProbeLock(key: string): Promise<boolean> {
    const isLocked = await this.redisClient.set(
      HALF_OPEN_PROBE_LOCK_KEY(key),
      '1',
      'PX',
      HALF_OPEN_PROBE_LOCK_TTL_MS,
      'NX',
    );
    return isLocked === 'OK';
  }

  /**
   * Pasa el circuito a HALF_OPEN y resetea éxitos de forma atómica.
   */
  async setToHalfOpen(key: string): Promise<void> {
    await this.redisClient.multi()
      .set(STATE_KEY(key), 'HALF_OPEN')
      .set(SUCCESSES_KEY(key), '0')
      .set(LAST_CHANGE_KEY(key), Date.now())
      .exec();
  }
  
  /**
   * Resetea fallos. Usado en CLOSED al tener éxito.
   */
  async resetFailures(key: string): Promise<void> {
    await this.redisClient.del(FAILURES_KEY(key));
  }

  /**
   * Incrementa el contador de éxitos de forma atómica y retorna el nuevo valor.
   */
  async incrementSuccesses(key: string): Promise<number> {
    return this.redisClient.incr(SUCCESSES_KEY(key));
  }

  /**
   * Pasa el circuito a CLOSED y limpia todos los contadores/locks de forma atómica.
   */
  async setToClosed(key: string): Promise<void> {
    await this.redisClient.multi()
      .set(STATE_KEY(key), 'CLOSED')
      .del(FAILURES_KEY(key))
      .del(SUCCESSES_KEY(key))
      .del(HALF_OPEN_PROBE_LOCK_KEY(key)) // Liberar lock de la sonda
      .set(LAST_CHANGE_KEY(key), Date.now())
      .exec();
  }

  /**
   * Incrementa el contador de fallos de forma atómica y retorna el nuevo valor.
   */
  async incrementFailures(key: string): Promise<number> {
    return this.redisClient.incr(FAILURES_KEY(key));
  }
  
  /**
   * Actualiza el timestamp del último cambio.
   */
  async updateLastChange(key: string): Promise<void> {
    await this.redisClient.set(LAST_CHANGE_KEY(key), Date.now());
  }

  /**
   * Pasa el circuito a OPEN y libera recursos asociados al estado OPEN.
   */
  async setToOpen(key: string, fromHalfOpen: boolean = false): Promise<void> {
    const multi = this.redisClient.multi()
      .set(STATE_KEY(key), 'OPEN')
      .set(LAST_CHANGE_KEY(key), Date.now());
      
    // Si viene de HALF_OPEN, liberar el lock de la sonda
    if (fromHalfOpen) {
      multi.del(HALF_OPEN_PROBE_LOCK_KEY(key)); 
    } else {
      multi.del(SUCCESSES_KEY(key)); 
    }

    await multi.exec();
  }

  /**
   * Resetea manualmente el circuito a CLOSED.
   */
  async manualReset(key: string): Promise<void> {
    await this.redisClient.multi()
      .set(STATE_KEY(key), 'CLOSED')
      .del(FAILURES_KEY(key))
      .del(SUCCESSES_KEY(key))
      .del(HALF_OPEN_PROBE_LOCK_KEY(key))
      .set(LAST_CHANGE_KEY(key), Date.now())
      .exec();
  }
  
  /**
   * Obtiene solo el estado principal del circuito.
   */
  async getState(key: string): Promise<CircuitState> {
    const state = await this.redisClient.get(STATE_KEY(key));
    return (state as CircuitState) || 'CLOSED';
  }
}
