import { ResilienceService } from './resilience.service';
import type { ResilienceConfig } from './resilience.interface';

export function Resilience(
  keyOrOptions?: string | (ResilienceConfig & { key?: string }),
): MethodDecorator {
  return (_t, propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as Function;

    descriptor.value = async function (...args: any[]) {
      const self = this as { resilience?: ResilienceService };
      if (!self?.resilience?.execute) {
        return await original.apply(this, args);
      }

      const cls = this?.constructor?.name ?? 'Service';
      const key =
        typeof keyOrOptions === 'string'
          ? keyOrOptions
          : keyOrOptions?.key ?? `${cls}:${String(propertyKey)}`;

      const config: ResilienceConfig = {
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
        circuitBreakerEnabled:
          typeof keyOrOptions === 'object' && keyOrOptions.circuitBreakerEnabled
            ? keyOrOptions.circuitBreakerEnabled
            : (self as any).circuitBreakerEnabled ?? false,
      };

      return self.resilience.execute(
        key,
        (signal?: AbortSignal) => original.apply(this, [...args, signal]),
        config,
      );
    };

    return descriptor;
  };
}
