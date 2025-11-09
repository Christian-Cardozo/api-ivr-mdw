import { Test, TestingModule } from '@nestjs/testing';
import { MatrizRuteoService } from '../matriz-ruteo/matriz-ruteo.service';

describe('MatrizRuteoService', () => {
  let service: MatrizRuteoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MatrizRuteoService],
    }).compile();

    service = module.get<MatrizRuteoService>(MatrizRuteoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
