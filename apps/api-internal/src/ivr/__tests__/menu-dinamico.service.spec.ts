import { Test, TestingModule } from '@nestjs/testing';
import { MenuDinamicoService } from './menu-dinamico.service';

describe('MenuDinamicoService', () => {
  let service: MenuDinamicoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MenuDinamicoService],
    }).compile();

    service = module.get<MenuDinamicoService>(MenuDinamicoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
