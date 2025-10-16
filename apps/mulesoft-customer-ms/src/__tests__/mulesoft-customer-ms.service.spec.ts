import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthClientService } from '@app/auth-client';
import { ResilienceService } from '@app/resilience';
import { MulesoftCustomerMsService } from '../mulesoft-customer-ms.service';

describe('MulesoftCustomerMsService', () => {
  const authClientMock = {
    getToken: jest.fn(),
    invalidateToken: jest.fn(),
  } as unknown as jest.Mocked<AuthClientService>;

  const resilienceMock = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<ResilienceService>;

  const configGetMock = jest.fn();
  const configServiceMock = {
    get: configGetMock,
  } as unknown as ConfigService;

  const originalFetch = global.fetch;
  let service: MulesoftCustomerMsService;

  beforeAll(() => {
    (global as any).fetch = jest.fn();
  });

  afterAll(() => {
    (global as any).fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    configGetMock.mockImplementation((key: string, defaultValue?: unknown) => {
      const values: Record<string, unknown> = {
        MULESOFT_CUSTOMER_BASE_URL: 'https://customer.test',
        MULESOFT_CLIENT_ID: 'client-123',
        MULESOFT_CUSTOMER_RETRIES: 2,
        MULESOFT_CUSTOMER_TIMEOUT_MS: 5000,
        MULESOFT_CUSTOMER_RETRY_DELAY_MS: 1000,
        MULESOFT_CUSTOMER_CB_ENABLED: false,
      };
      return key in values ? values[key] : defaultValue;
    });

    service = new MulesoftCustomerMsService(
      authClientMock,
      resilienceMock,
      configServiceMock,
    );
  });

  it('should delegate the ANI lookup through the resilience layer', async () => {
    authClientMock.getToken.mockResolvedValue('token-123');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ data: 'value' }),
    });

    resilienceMock.execute.mockImplementation(async (_key, task) => task(undefined as any));

    const result = await service.getByANI('555', undefined);

    expect(resilienceMock.execute).toHaveBeenCalledWith(
      'mule:getByANI',
      expect.any(Function),
      expect.objectContaining({
        maxRetries: 2,
        timeoutMs: 5000,
        retryDelayMs: 1000,
        circuitBreakerEnabled: false,
      }),
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'https://customer.test/api/v1/customer?excludeNulls=true&deepLevel=3&mobileNumber=555',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token-123',
          client_id: 'client-123',
        },
        signal: undefined,
      },
    );
    expect(result).toEqual({ data: 'value' });
  });

  it('should invalidate the token when a 401 response is received', async () => {
    authClientMock.getToken.mockResolvedValue('expired-token');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: jest.fn().mockResolvedValue('Unauthorized'),
    });

    resilienceMock.execute.mockImplementation(async (_key, task) => task(undefined as any));

    let thrown: HttpException | undefined;
    try {
      await service.getByDNI('12345678');
    } catch (error) {
      thrown = error as HttpException;
    }

    expect(thrown).toBeInstanceOf(HttpException);
    expect(thrown?.getStatus()).toBe(401);
    expect(authClientMock.invalidateToken).toHaveBeenCalledTimes(1);
  });

  it('should decide correctly whether to retry based on the error', () => {
    const shouldRetry = (service as unknown as { shouldRetry: (error: unknown) => boolean }).shouldRetry.bind(service);

    expect(shouldRetry(new HttpException('Unauthorized', 401))).toBe(true);
    expect(shouldRetry(new HttpException('Not Found', 404))).toBe(false);
    expect(shouldRetry(new HttpException('Server error', 503))).toBe(true);
    expect(shouldRetry({ code: 'ETIMEDOUT' })).toBe(true);
    expect(shouldRetry({ code: 'ECONNREFUSED' })).toBe(true);
  });
});