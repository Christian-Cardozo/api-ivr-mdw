import { RedisService } from './redis.service';

describe('RedisService', () => {
  const redisClientMock = {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  } as unknown as {
    get: jest.Mock;
    set: jest.Mock;
    setex: jest.Mock;
    del: jest.Mock;
    quit: jest.Mock;
  };

  let service: RedisService;

  beforeEach(() => {
    jest.clearAllMocks();
    redisClientMock.set.mockResolvedValue('OK');
    service = new RedisService(redisClientMock as any);
  });

  it('should return a cached token when it is still valid', async () => {
    const cached = JSON.stringify({ token: 'cached-token', expiresAt: Date.now() + 10 * 60 * 1000 });
    redisClientMock.get.mockResolvedValueOnce(cached);

    const token = await service.getToken('key', jest.fn());

    expect(token).toBe('cached-token');
    expect(redisClientMock.set).not.toHaveBeenCalledWith('key:lock', expect.anything());
  });

  it('should renew the token when the cache is expired or missing', async () => {
    const expired = JSON.stringify({ token: 'old-token', expiresAt: Date.now() });
    redisClientMock.get
      .mockResolvedValueOnce(expired) // initial cache check
      .mockResolvedValueOnce(null); // double-check after acquiring the lock

    const fetchNewToken = jest.fn().mockResolvedValue({ token: 'fresh-token', expiresIn: 3600 });

    const token = await service.getToken('key', fetchNewToken, 0.1);

    expect(fetchNewToken).toHaveBeenCalledTimes(1);
    expect(redisClientMock.setex).toHaveBeenCalledWith(
      'key',
      3600,
      expect.stringContaining('fresh-token'),
    );
    expect(redisClientMock.del).toHaveBeenCalledWith('key:lock');
    expect(token).toBe('fresh-token');
  });

  it('should invalidate a token by deleting the key', async () => {
    await service.invalidateToken('key');

    expect(redisClientMock.del).toHaveBeenCalledWith('key');
  });
});
