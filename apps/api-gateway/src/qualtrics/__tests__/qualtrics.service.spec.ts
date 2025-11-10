import { Test, TestingModule } from '@nestjs/testing';
import { QualtricsService } from '../qualtrics.service';

describe('QualtricsService', () => {
  let service: QualtricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QualtricsService],
    }).compile();

    service = module.get<QualtricsService>(QualtricsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
