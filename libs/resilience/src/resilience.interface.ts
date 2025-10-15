export interface ResilienceConfig {
    maxRetries?: number; // Número de reintentos
    retryDelayMs?: number; // Retardo entre reintentos en milisegundos
    timeoutMs?: number; // Tiempo máximo de espera para la operación en milisegundos
    retryOn?: (error: any) => boolean; // Función para determinar si se debe reintentar según el error
    circuitBreakerEnabled?: boolean; // Determina si utilizar el circuit breaker
}