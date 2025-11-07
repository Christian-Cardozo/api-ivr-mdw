import { Test, TestingModule } from '@nestjs/testing';
import { MatrizRuteoController } from '../matriz-ruteo.controller';
import { MatrizRuteoService } from '../matriz-ruteo.service';

describe('MatrizRuteoController', () => {
  let controller: MatrizRuteoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatrizRuteoController],
      providers: [MatrizRuteoService],
    }).compile();

    controller = module.get<MatrizRuteoController>(MatrizRuteoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
