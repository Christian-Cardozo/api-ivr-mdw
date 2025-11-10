import { Test, TestingModule } from '@nestjs/testing';
import { PipuFiService } from './pipu-fi.service';

describe('PipuFiService', () => {
  let service: PipuFiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PipuFiService],
    }).compile();

    service = module.get<PipuFiService>(PipuFiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
