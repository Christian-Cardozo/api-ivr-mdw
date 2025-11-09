import { Test, TestingModule } from '@nestjs/testing';
import { MartechService } from '../martech.service';

describe('MartechService', () => {
  let service: MartechService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MartechService],
    }).compile();

    service = module.get<MartechService>(MartechService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
