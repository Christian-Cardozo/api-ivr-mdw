import { Test, TestingModule } from '@nestjs/testing';
import { MovilLastCallService } from './movil-last-call.service';

describe('MovilLastCallService', () => {
  let service: MovilLastCallService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovilLastCallService],
    }).compile();

    service = module.get<MovilLastCallService>(MovilLastCallService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
