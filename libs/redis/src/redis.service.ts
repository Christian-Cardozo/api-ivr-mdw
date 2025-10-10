import { Injectable, Inject, OnModuleDestroy, Logger } from '@nestjs/common';
import type Redis from 'ioredis';

interface TokenData {
  token: string;
  expiresAt: number;
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Obtiene un token con cache y lock distribuido
   */
  async getToken(
    key: string,
    fetchNewToken: () => Promise<{ token: string; expiresIn: number }>,
    bufferMinutes = 5,
  ): Promise<string> {
    const bufferMs = bufferMinutes * 60 * 1000;

    // 1. Intentar obtener de cache
    const cached = await this.redis.get(key);
    if (cached) {
      const { token, expiresAt }: TokenData = JSON.parse(cached);
      if (expiresAt - Date.now() > bufferMs) {
        return token;
      }
    }

    // 2. Intentar lock
    const lockKey = `${key}:lock`;
    const locked = await this.acquireLock(lockKey, 10);

    if (!locked) {
      // Esperar y reintentar
      await this.sleep(500);
      return this.getToken(key, fetchNewToken, bufferMinutes);
    }

    try {
      // 3. Double-check
      const recheck = await this.redis.get(key);
      if (recheck) {
        const { token, expiresAt }: TokenData = JSON.parse(recheck);
        if (expiresAt - Date.now() > bufferMs) {
          return token;
        }
      }

      // 4. Renovar token
      this.logger.log(`Renovando token: ${key}`);
      const { token, expiresIn } = await fetchNewToken();

      // 5. Guardar en cache
      const data: TokenData = {
        token,
        expiresAt: Date.now() + expiresIn * 1000,
      };
      await this.redis.setex(key, expiresIn, JSON.stringify(data));

      return token;
    } finally {
      await this.releaseLock(lockKey);
    }
  }

  /**
   * Invalida un token
   */
  async invalidateToken(key: string): Promise<void> {
    this.logger.log(`Invalidando token: ${key}`);
    await this.redis.del(key);
  }

  /**
   * Adquiere un lock distribuido
   */
  private async acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
    const result = await this.redis.set(key, '1', 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  }

  /**
   * Libera un lock
   */
  private async releaseLock(key: string): Promise<void> {
    await this.redis.del(key);
  }

  /**
   * Get genérico (para otros usos)
   */
  async get(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * Set genérico con TTL opcional
   */
  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, value);
    } else {
      await this.redis.set(key, value);
    }
  }

  /**
   * Delete genérico
   */
  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}