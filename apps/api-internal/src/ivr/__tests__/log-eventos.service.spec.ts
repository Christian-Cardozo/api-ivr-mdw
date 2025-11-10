import { Test, TestingModule } from '@nestjs/testing';
import { LogEventosService } from './log-eventos.service';

describe('LogEventosService', () => {
  let service: LogEventosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LogEventosService],
    }).compile();

    service = module.get<LogEventosService>(LogEventosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
