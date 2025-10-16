import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { MulesoftService } from '../mulesoft.service';
import { AuthClientService } from '@app/auth-client';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';
import { of } from 'rxjs';

describe('MulesoftService', () => {
  let service: MulesoftService;

  const authServiceMock = {
    getToken: jest.fn(),
  } satisfies Partial<AuthClientService>;

  const configServiceMock = {
    get: jest.fn(),
  } satisfies Partial<ConfigService>;

  const clientProxyMock = {
    send: jest.fn(),
  } satisfies Partial<ClientProxy>;

  const originalFetch = global.fetch;

  beforeAll(() => {
    (global as any).fetch = jest.fn();
  });

  afterAll(() => {
    (global as any).fetch = originalFetch;
  });

  beforeEach(async () => {
    const configValues: Record<string, string> = {
      MULESOFT_CANCEL_BASE_URL: 'https://mulesoft.test',
      MULESOFT_CLIENT_ID: 'client-123',
    };

    configServiceMock.get = jest
      .fn()
      .mockImplementation((key: string) => configValues[key]);

    authServiceMock.getToken = jest.fn().mockResolvedValue('token-xyz');

    clientProxyMock.send = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MulesoftService,
        { provide: AuthClientService, useValue: authServiceMock },
        { provide: ConfigService, useValue: configServiceMock },
        { provide: 'MULESOFT_CUSTOMER_MS', useValue: clientProxyMock },
      ],
    }).compile();

    service = module.get<MulesoftService>(MulesoftService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMulesoftCustomerByANI', () => {
    it('should delegate the request to the customer microservice', () => {
      const ani = '1234567890';
      const response$ = of('payload');
      (clientProxyMock.send as jest.Mock).mockReturnValue(response$);

      const result = service.getMulesoftCustomerByANI(ani);

      expect(clientProxyMock.send).toHaveBeenCalledWith('get-by-ani', ani);
      expect(result).toBe(response$);
    });
  });

  describe('getMulesoftCustomerByDNI', () => {
    it('should delegate the request to the customer microservice', () => {
      const dni = '99887766';
      const response$ = of('payload');
      (clientProxyMock.send as jest.Mock).mockReturnValue(response$);

      const result = service.getMulesoftCustomerByDNI(dni);

      expect(clientProxyMock.send).toHaveBeenCalledWith('get-by-dni', dni);
      expect(result).toBe(response$);
    });
  });

  describe('getMulesoftCancellation', () => {
    const params = {
      xcorrelationid: 'corr-1',
      currentApplication: 'ivr',
      currentComponent: 'middleware',
      action: 'cancel',
    };
    const body = JSON.stringify({ id: '123' });

    it('should perform the HTTP request with the expected headers and body', async () => {
      const fetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({ ok: true }),
      } as const;
      (global.fetch as jest.Mock).mockResolvedValue(fetchResponse);

      const result = await service.getMulesoftCancellation(params, body);

      expect(authServiceMock.getToken).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        'https://mulesoft.test/api/v1/retention/cancel',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer token-xyz',
            client_id: 'client-123',
            'x-correlation-id': 'corr-1',
            currentApplication: 'ivr',
            currentComponent: 'middleware',
            sourceApplication: 'IVR',
            sourceComponent: 'Martech',
          },
          body,
        }
      );
      expect(fetchResponse.json).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ ok: true });
    });

    it('should throw an HttpException when the upstream call fails', async () => {
      const fetchResponse = {
        ok: false,
        status: 502,
        text: jest.fn().mockResolvedValue('bad gateway'),
      };
      (global.fetch as jest.Mock).mockResolvedValue(fetchResponse);

      let thrownError: HttpException | undefined;
      try {
        await service.getMulesoftCancellation(params, body);
      } catch (error) {
        thrownError = error as HttpException;
      }

      expect(thrownError).toBeInstanceOf(HttpException);
      expect(thrownError?.getStatus()).toBe(502);
      expect(thrownError?.message).toBe('bad gateway');
      expect(fetchResponse.text).toHaveBeenCalledTimes(1);
    });
  });
});
