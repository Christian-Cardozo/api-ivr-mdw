import { Test, TestingModule } from '@nestjs/testing';
import { SolconService } from '../solcon.service';

describe('SolconService', () => {
  let service: SolconService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolconService],
    }).compile();

    service = module.get<SolconService>(SolconService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
