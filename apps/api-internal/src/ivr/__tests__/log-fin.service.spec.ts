import { Test, TestingModule } from '@nestjs/testing';
import { LogFinService } from './log-fin.service';

describe('LogFinService', () => {
  let service: LogFinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogFinService],
    }).compile();

    service = module.get<LogFinService>(LogFinService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
