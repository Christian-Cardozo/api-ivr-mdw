import { Test, TestingModule } from '@nestjs/testing';
import { InterrupcionesService } from './interrupciones.service';

describe('InterrupcionesService', () => {
  let service: InterrupcionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InterrupcionesService],
    }).compile();

    service = module.get<InterrupcionesService>(InterrupcionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
