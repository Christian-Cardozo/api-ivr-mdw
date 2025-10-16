import { AuthClientService } from './auth-client.service';
import { RedisService } from '@app/redis';
import { ConfigService } from '@nestjs/config';

describe('AuthClientService', () => {
  const redisServiceMock = {
    getToken: jest.fn(),
    invalidateToken: jest.fn(),
  } as unknown as jest.Mocked<RedisService>;

  const configGetMock = jest.fn();
  const configServiceMock = {
    get: configGetMock,
  } as unknown as ConfigService;

  const originalFetch = global.fetch;
  let service: AuthClientService;

  beforeAll(() => {
    (global as any).fetch = jest.fn();
  });

  afterAll(() => {
    (global as any).fetch = originalFetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    configGetMock.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        IDP_URL: 'https://idp.test/token',
        IDP_USERKEY: 'client-id:secret',
      };
      return values[key];
    });

    service = new AuthClientService(redisServiceMock, configServiceMock);
  });

  it('should retrieve the token through the Redis cache helper', async () => {
    const fetchResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({ access_token: 'fresh-token', expires_in: 1200 }),
    };
    (global.fetch as jest.Mock).mockResolvedValue(fetchResponse);

    redisServiceMock.getToken.mockImplementation(async (_key, fetcher) => {
      const { token } = await fetcher();
      return token;
    });

    const token = await service.getToken();

    expect(redisServiceMock.getToken).toHaveBeenCalledWith(
      'idp:mule:token',
      expect.any(Function),
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://idp.test/token',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: expect.stringMatching(/^Basic\s+/),
          'Content-Type': 'application/json',
        }),
      }),
    );
    expect(token).toBe('fresh-token');
  });

  it('should propagate errors when the IDP request fails', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      statusText: 'Forbidden',
    });

    const fetcher = async () =>
      (service as unknown as { fetchToken: () => Promise<{ token: string; expiresIn: number }> }).fetchToken();

    await expect(fetcher()).rejects.toThrow('Error fetching token: Forbidden');
  });

  it('should invalidate the token via Redis', async () => {
    await service.invalidateToken();

    expect(redisServiceMock.invalidateToken).toHaveBeenCalledWith('idp:mule:token');
  });
});
