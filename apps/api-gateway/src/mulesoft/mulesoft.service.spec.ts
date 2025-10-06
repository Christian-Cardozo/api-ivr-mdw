import { Test, TestingModule } from '@nestjs/testing';
import { MulesoftService } from './mulesoft.service';

describe('MulesoftService', () => {
  let service: MulesoftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MulesoftService],
    }).compile();

    service = module.get<MulesoftService>(MulesoftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
