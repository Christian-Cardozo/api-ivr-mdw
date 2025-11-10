import { Test, TestingModule } from '@nestjs/testing';
import { EscenariosService } from '../escenarios/escenarios.service';

describe('EscenariosService', () => {
  let service: EscenariosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EscenariosService],
    }).compile();

    service = module.get<EscenariosService>(EscenariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
