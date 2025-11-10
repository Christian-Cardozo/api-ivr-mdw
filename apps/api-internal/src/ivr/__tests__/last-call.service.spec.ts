import { Test, TestingModule } from '@nestjs/testing';
import { LastCallService } from './last-call.service';

describe('LastCallService', () => {
  let service: LastCallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LastCallService],
    }).compile();

    service = module.get<LastCallService>(LastCallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
