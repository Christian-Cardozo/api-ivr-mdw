export class NonRetryableError extends Error {
  constructor(public readonly original: any) {
    super(original?.message ?? 'Non-retryable error');
    this.name = 'NonRetryableError';
  }
}
