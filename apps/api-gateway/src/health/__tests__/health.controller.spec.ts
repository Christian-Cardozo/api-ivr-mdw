import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckResult, HealthCheckService, MemoryHealthIndicator, MicroserviceHealthIndicator } from '@nestjs/terminus';
import { HealthController } from '../health.controller';
import { Transport } from '@nestjs/microservices';

describe('HealthController', () => {
  let controller: HealthController;

  const healthServiceMock = {
    check: jest.fn(),
  } as unknown as jest.Mocked<HealthCheckService>;

  const microserviceHealthMock = {
    pingCheck: jest.fn(),
  } as unknown as jest.Mocked<MicroserviceHealthIndicator>;

  const memoryHealthMock = {
    checkHeap: jest.fn(),
    checkRSS: jest.fn(),
  } as unknown as jest.Mocked<MemoryHealthIndicator>;

  beforeEach(async () => {
    healthServiceMock.check = jest.fn();
    microserviceHealthMock.pingCheck = jest.fn();
    memoryHealthMock.checkHeap = jest.fn();
    memoryHealthMock.checkRSS = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: healthServiceMock },
        { provide: MicroserviceHealthIndicator, useValue: microserviceHealthMock },
        { provide: MemoryHealthIndicator, useValue: memoryHealthMock },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should run the configured health checks', async () => {
    const expected: HealthCheckResult = { status: 'ok', info: {} };

    healthServiceMock.check.mockImplementation(async (indicators) => {
      for (const indicator of indicators) {
        await indicator();
      }
      return expected;
    });

    microserviceHealthMock.pingCheck.mockResolvedValue({ status: 'ok' });
    memoryHealthMock.checkHeap.mockResolvedValue({});
    memoryHealthMock.checkRSS.mockResolvedValue({});

    const result = await controller.check();

    expect(result).toBe(expected);
    expect(healthServiceMock.check).toHaveBeenCalledTimes(1);
    expect(microserviceHealthMock.pingCheck).toHaveBeenCalledWith('mulesoft-customer-ms', {
      transport: Transport.TCP,
      options: { host: 'localhost', port: 3001 },
    });
    expect(microserviceHealthMock.pingCheck).toHaveBeenCalledWith('redis', {
      transport: Transport.REDIS,
      options: { host: 'localhost', port: 6379 },
    });
    expect(memoryHealthMock.checkHeap).toHaveBeenCalledWith('memory_heap', 200 * 1024 * 1024);
    expect(memoryHealthMock.checkRSS).toHaveBeenCalledWith('memory_rss', 3000 * 1024 * 1024);
  });
});
