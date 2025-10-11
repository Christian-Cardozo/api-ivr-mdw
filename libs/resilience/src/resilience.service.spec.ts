import { Test, TestingModule } from '@nestjs/testing';
import { ResilienceService } from './resilience.service';

describe('ResilienceService', () => {
  let service: ResilienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResilienceService],
    }).compile();

    service = module.get<ResilienceService>(ResilienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
