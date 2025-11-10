import { Test, TestingModule } from '@nestjs/testing';
import { ResponsysService } from './responsys.service';

describe('ResponsysService', () => {
  let service: ResponsysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResponsysService],
    }).compile();

    service = module.get<ResponsysService>(ResponsysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
