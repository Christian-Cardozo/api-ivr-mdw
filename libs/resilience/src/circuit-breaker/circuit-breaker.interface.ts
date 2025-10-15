export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number;  // cuántos fallos seguidos abren el circuito
  resetTimeoutMs?: number;    // cuánto tiempo queda en OPEN antes de probar de nuevo
  successThreshold?: number;
}

export interface CircuitBreakerState {
  failures: number;
  successes: number; // ✅ Contar éxitos en HALF_OPEN
  state: CircuitState;
  halfOpenProbeInFlight?: boolean;
  lastFailureTime: number;
  lastStateChange: number;
}
