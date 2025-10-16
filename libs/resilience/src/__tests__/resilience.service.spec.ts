import { RequestTimeoutException } from '@nestjs/common';
import { CircuitBreakerService } from '../circuit-breaker/circuit-breaker.service';
import { ResilienceService } from '../resilience.service';
import { NonRetryableError } from '@app/common/errors';

describe('ResilienceService', () => {
  const circuitBreakerMock = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<CircuitBreakerService>;

  let service: ResilienceService;
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ResilienceService(circuitBreakerMock);
    (service as unknown as { sleep: () => Promise<void> }).sleep = jest.fn().mockResolvedValue(undefined);
  });

  it('should delegate to the circuit breaker when enabled', async () => {
    const executeWithRetrySpy = jest
      .spyOn(service as unknown as { executeWithRetry: typeof service.executeWithRetry }, 'executeWithRetry')
      .mockResolvedValue('ok');

    circuitBreakerMock.execute.mockImplementation(async (_key, wrappedFn) => wrappedFn());

    const fn = jest.fn().mockResolvedValue('ignored');
    const result = await service.execute('customer', fn, { circuitBreakerEnabled: true });
    expect(circuitBreakerMock.execute).toHaveBeenCalledWith('customer', expect.any(Function));
    expect(executeWithRetrySpy).toHaveBeenCalledWith('customer', fn, expect.objectContaining({ circuitBreakerEnabled: true }));
    expect(result).toBe('ok');
  });

  it('should execute without the circuit breaker when disabled', async () => {
    const executeWithRetrySpy = jest
      .spyOn(service as unknown as { executeWithRetry: typeof service.executeWithRetry }, 'executeWithRetry')
      .mockResolvedValue('success');

    const fn = jest.fn();
    const result = await service.execute('customer', fn, { circuitBreakerEnabled: false });

    expect(circuitBreakerMock.execute).not.toHaveBeenCalled();
    expect(executeWithRetrySpy).toHaveBeenCalledWith('customer', fn, expect.objectContaining({ circuitBreakerEnabled: false }));
    expect(result).toBe('success');
  });

  it('should retry until the operation succeeds', async () => {
    let attempts = 0;
    const task = jest.fn(async () => {
      attempts += 1;
      if (attempts < 3) {
        throw new Error('temporary');
      }
      return 'final';
    });

    const result = await service.executeWithRetry('operation', task, {
      maxRetries: 3,
      retryDelayMs: 1,
      timeoutMs: 50,
      retryOn: () => true,
    });

    expect(task).toHaveBeenCalledTimes(3);
    expect(result).toBe('final');
  });

  it('should wrap non-retryable errors', async () => {
    const task = jest.fn().mockRejectedValue(new Error('bad input'));

    await expect(
      service.executeWithRetry('operation', task, {
        maxRetries: 1,
        retryOn: () => false,
      }),
    ).rejects.toBeInstanceOf(NonRetryableError);
  });

  it('should convert aborts into RequestTimeoutException', async () => {
    jest.useFakeTimers();
    const controller = new AbortController();

    const promise = (service as unknown as {
      executeWithTimeout: <T>(fn: (signal?: AbortSignal) => Promise<T>, timeoutMs: number, controller: AbortController) => Promise<T>;
    }).executeWithTimeout(
      (signal?: AbortSignal) =>
        new Promise((_, reject) => {
          signal?.addEventListener('abort', () => reject(new Error('aborted')));
        }),
      10,
      controller,
    );

    jest.runAllTimers();

    await expect(promise).rejects.toBeInstanceOf(RequestTimeoutException);
    jest.useRealTimers();
  });
});