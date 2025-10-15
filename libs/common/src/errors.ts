export class NonRetryableError extends Error {
  constructor(public readonly original: any) {
    super(original?.message ?? 'Non-retryable error');
    this.name = 'NonRetryableError';
  }
}

export class CircuitOpenError extends Error {
  constructor(public key: string) {
    super(`Circuit breaker OPEN for ${key}`);
    this.name = 'CircuitOpenError';
  }
}