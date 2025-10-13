import { ResilienceService } from './resilience.service';
import type { RetryConfig } from './resilience.service';


export function Retry(
  keyOrOptions?: string | (RetryConfig & { key?: string }),
): MethodDecorator {
  return (_t, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as Function;

    descriptor.value = async function (...args: any[]) {
      const self = this as { resilience?: ResilienceService };
      if (!self?.resilience?.executeWithRetry) {
        return await original.apply(this, args);
      }

      const cls = this?.constructor?.name ?? 'Service';
      const key =
        typeof keyOrOptions === 'string'
          ? keyOrOptions
          : keyOrOptions?.key ?? `${cls}:${String(propertyKey)}`;

      const config: RetryConfig = {
        maxRetries:
          typeof keyOrOptions === 'object' && keyOrOptions.maxRetries
            ? keyOrOptions.maxRetries
            : (self as any).maxRetries ?? 3,
        timeoutMs:
          typeof keyOrOptions === 'object' && keyOrOptions.timeoutMs
            ? keyOrOptions.timeoutMs
            : (self as any).timeout ?? 5000,
        retryDelayMs:
          typeof keyOrOptions === 'object' && keyOrOptions.retryDelayMs
            ? keyOrOptions.retryDelayMs
            : (self as any).retryDelayMs ?? 1000,
        retryOn:
          typeof keyOrOptions === 'object' && keyOrOptions.retryOn
            ? keyOrOptions.retryOn
            : (self as any).shouldRetry ?? ((e: any) => !(e?.status >= 400 && e?.status < 500)),
      };

      return self.resilience.executeWithRetry(
        key,
        (signal?: AbortSignal) => original.apply(this, [...args, signal]),
        config,
      );
    };

    return descriptor;
  };
}
