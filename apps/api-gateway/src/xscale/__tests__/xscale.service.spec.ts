import { Test, TestingModule } from '@nestjs/testing';
import { XscaleService } from '../xscale.service';

describe('XscaleService', () => {
  let service: XscaleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [XscaleService],
    }).compile();

    service = module.get<XscaleService>(XscaleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
