import { Test, TestingModule } from '@nestjs/testing';
import { MatrizRuteoController } from '../matriz-ruteo.controller';
import { MatrizRuteoService } from '../matriz-ruteo.service';
import { MatrizRuteoDto } from '../dtos/matriz-ruteo.dto';

describe('MatrizRuteoController', () => {
  let controller: MatrizRuteoController;
  let service: jest.Mocked<MatrizRuteoService>;

  const serviceMock = {
    resolverDerivacion: jest.fn(),
  } as unknown as jest.Mocked<MatrizRuteoService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MatrizRuteoController],
      providers: [
        {
          provide: MatrizRuteoService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<MatrizRuteoController>(MatrizRuteoController);
    service = module.get(MatrizRuteoService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMatrizRuteo', () => {
    it('should call resolverDerivacion with correct body and return result', async () => {
      const mockDto: MatrizRuteoDto = {
        rama: 'RAMA1',
        producto: 'PROD1',
        segmento: 'SEG1',
        prefijo: 'PREF1',
        ambiente: 'DEV',
      };

      const mockResult = {
        status: 'OK',
        message: 'Derivacion encontrada',
        derivacion: 'DERIV1',
      };

      serviceMock.resolverDerivacion.mockResolvedValue(mockResult);

      const result = await controller.getMatrizRuteo(mockDto);

      expect(serviceMock.resolverDerivacion).toHaveBeenCalledWith(mockDto);
      expect(serviceMock.resolverDerivacion).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockResult);
    });

    it('should handle service errors', async () => {
      const mockDto: MatrizRuteoDto = {
        rama: 'RAMA1',
        producto: 'PROD1',
        segmento: 'SEG1',
        prefijo: 'PREF1',
        ambiente: 'DEV',
      };

      const mockError = new Error('Service error');
      serviceMock.resolverDerivacion.mockRejectedValue(mockError);

      await expect(controller.getMatrizRuteo(mockDto)).rejects.toThrow(
        'Service error',
      );
    });
  });
});
