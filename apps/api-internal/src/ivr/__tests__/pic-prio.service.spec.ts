import { Test, TestingModule } from '@nestjs/testing';
import { PicPrioService } from './pic-prio.service';

describe('PicPrioService', () => {
  let service: PicPrioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PicPrioService],
    }).compile();

    service = module.get<PicPrioService>(PicPrioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
