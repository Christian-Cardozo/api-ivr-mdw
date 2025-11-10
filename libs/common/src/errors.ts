import { HttpException, HttpStatus } from "@nestjs/common";

export class NonRetryableError extends Error {
  constructor(public readonly original: any) {
    super(original?.message ?? 'Non-retryable error');
    this.name = 'NonRetryableError';
  }
}

export class CircuitOpenError extends HttpException {
  constructor(public key: string, status = HttpStatus.SERVICE_UNAVAILABLE) {
    super(
      {
        statusCode: status,
        error: 'Service Unavailable',
        code: 'CIRCUIT_OPEN',
        message: `Circuit breaker OPEN for ${key}`,
        key,
      },
      status,
    );
    this.name = 'CircuitOpenError';
  }
}
