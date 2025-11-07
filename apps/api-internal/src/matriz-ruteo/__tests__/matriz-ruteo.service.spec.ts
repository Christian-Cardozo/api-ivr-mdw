import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { MatrizRuteoService } from '../matriz-ruteo.service';
import { IvrappsMatrizRuteo } from '../../entities/ivrapps-matriz-ruteo.entity';
import { CalendarioServicio } from '../../entities/calendario-servicio.entity';

describe('MatrizRuteoService', () => {
  let service: MatrizRuteoService;
  let repositoryMatriz: jest.Mocked<Repository<IvrappsMatrizRuteo>>;
  let repositoryCalendario: jest.Mocked<Repository<CalendarioServicio>>;

  const mockMatrizRepository = {
    findBy: jest.fn(),
  };

  const mockCalendarioRepository = {
    findOneBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatrizRuteoService,
        {
          provide: getRepositoryToken(IvrappsMatrizRuteo),
          useValue: mockMatrizRepository,
        },
        {
          provide: getRepositoryToken(CalendarioServicio),
          useValue: mockCalendarioRepository,
        },
      ],
    }).compile();

    service = module.get<MatrizRuteoService>(MatrizRuteoService);
    repositoryMatriz = module.get(getRepositoryToken(IvrappsMatrizRuteo));
    repositoryCalendario = module.get(getRepositoryToken(CalendarioServicio));

    jest.clearAllMocks();
  });

  describe('resolverDerivacion', () => {
    const mockBody = {
      rama: 'RAMA1',
      producto: 'PROD1',
      segmento: 'SEG1',
      prefijo: 'PREF1',
      ambiente: 'DEV' as const,
    };

    it('should throw NotFoundException when no rules are found for environment', async () => {
      mockMatrizRepository.findBy.mockResolvedValue([]);

      await expect(service.resolverDerivacion(mockBody)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockMatrizRepository.findBy).toHaveBeenCalledWith({
        ambiente: 'DEV',
      });
    });

    it('should throw NotFoundException when no matching rules are found', async () => {
      const mockRegistros: Partial<IvrappsMatrizRuteo>[] = [
        {
          id: 1,
          rama: 'RAMA2',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          ambiente: 'DEV',
        },
      ];
      mockMatrizRepository.findBy.mockResolvedValue(
        mockRegistros as IvrappsMatrizRuteo[],
      );

      await expect(service.resolverDerivacion(mockBody)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return derivacion when matching rule is found and within schedule', async () => {
      const mockRegistros: Partial<IvrappsMatrizRuteo>[] = [
        {
          id: 1,
          rama: 'RAMA1',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          derivacion: 'DERIV1',
          peso: 10,
          calendario: 'CAL1',
          ambiente: 'DEV',
        },
      ];

      const mockCalendario: Partial<CalendarioServicio> = {
        calendario: 'CAL1',
        lunesInicio: '09:00:00',
        lunesFin: '18:00:00',
        feriados: undefined,
      };

      mockMatrizRepository.findBy.mockResolvedValue(
        mockRegistros as IvrappsMatrizRuteo[],
      );
      mockCalendarioRepository.findOneBy.mockResolvedValue(
        mockCalendario as CalendarioServicio,
      );

      // Mock current date to be Monday at 10:00 AM
      const mockDate = new Date('2024-01-01T10:00:00-03:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(1); // Monday
      jest.spyOn(mockDate, 'getFullYear').mockReturnValue(2024);

      const result = await service.resolverDerivacion(mockBody);

      expect(result).toEqual({
        status: 'OK',
        message: 'Derivacion encontrada',
        derivacion: 'DERIV1',
      });
      expect(mockCalendarioRepository.findOneBy).toHaveBeenCalledWith({
        calendario: 'CAL1',
      });

      jest.restoreAllMocks();
    });

    it('should select rule with higher peso when multiple matches exist', async () => {
      const mockRegistros: Partial<IvrappsMatrizRuteo>[] = [
        {
          id: 1,
          rama: 'RAMA1',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          derivacion: 'DERIV1',
          peso: 5,
          calendario: 'CAL1',
          ambiente: 'DEV',
        },
        {
          id: 2,
          rama: 'RAMA1',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          derivacion: 'DERIV2',
          peso: 10,
          calendario: 'CAL1',
          ambiente: 'DEV',
        },
      ];

      const mockCalendario: Partial<CalendarioServicio> = {
        calendario: 'CAL1',
        lunesInicio: '09:00:00',
        lunesFin: '18:00:00',
        feriados: undefined,
      };

      mockMatrizRepository.findBy.mockResolvedValue(
        mockRegistros as IvrappsMatrizRuteo[],
      );
      mockCalendarioRepository.findOneBy.mockResolvedValue(
        mockCalendario as CalendarioServicio,
      );

      const mockDate = new Date('2024-01-01T10:00:00-03:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(1);
      jest.spyOn(mockDate, 'getFullYear').mockReturnValue(2024);

      const result = await service.resolverDerivacion(mockBody);

      expect(result.derivacion).toBe('DERIV2');

      jest.restoreAllMocks();
    });

    it('should select rule with lower id when peso is equal', async () => {
      const mockRegistros: Partial<IvrappsMatrizRuteo>[] = [
        {
          id: 2,
          rama: 'RAMA1',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          derivacion: 'DERIV2',
          peso: 10,
          calendario: 'CAL1',
          ambiente: 'DEV',
        },
        {
          id: 1,
          rama: 'RAMA1',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          derivacion: 'DERIV1',
          peso: 10,
          calendario: 'CAL1',
          ambiente: 'DEV',
        },
      ];

      const mockCalendario: Partial<CalendarioServicio> = {
        calendario: 'CAL1',
        lunesInicio: '09:00:00',
        lunesFin: '18:00:00',
        feriados: undefined,
      };

      mockMatrizRepository.findBy.mockResolvedValue(
        mockRegistros as IvrappsMatrizRuteo[],
      );
      mockCalendarioRepository.findOneBy.mockResolvedValue(
        mockCalendario as CalendarioServicio,
      );

      const mockDate = new Date('2024-01-01T10:00:00-03:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(1);
      jest.spyOn(mockDate, 'getFullYear').mockReturnValue(2024);

      const result = await service.resolverDerivacion(mockBody);

      expect(result.derivacion).toBe('DERIV1');

      jest.restoreAllMocks();
    });

    it('should throw NotFoundException when calendar is not found', async () => {
      const mockRegistros: Partial<IvrappsMatrizRuteo>[] = [
        {
          id: 1,
          rama: 'RAMA1',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          derivacion: 'DERIV1',
          peso: 10,
          calendario: 'CAL1',
          ambiente: 'DEV',
        },
      ];

      mockMatrizRepository.findBy.mockResolvedValue(
        mockRegistros as IvrappsMatrizRuteo[],
      );
      mockCalendarioRepository.findOneBy.mockResolvedValue(null);

      await expect(service.resolverDerivacion(mockBody)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when outside business hours', async () => {
      const mockRegistros: Partial<IvrappsMatrizRuteo>[] = [
        {
          id: 1,
          rama: 'RAMA1',
          producto: 'PROD1',
          segmento: 'SEG1',
          prefijo: 'PREF1',
          derivacion: 'DERIV1',
          peso: 10,
          calendario: 'CAL1',
          ambiente: 'DEV',
        },
      ];

      const mockCalendario: Partial<CalendarioServicio> = {
        calendario: 'CAL1',
        lunesInicio: '09:00:00',
        lunesFin: '18:00:00',
        feriados: undefined,
      };

      mockMatrizRepository.findBy.mockResolvedValue(
        mockRegistros as IvrappsMatrizRuteo[],
      );
      mockCalendarioRepository.findOneBy.mockResolvedValue(
        mockCalendario as CalendarioServicio,
      );

      // Mock current date to be Monday at 20:00 PM (outside hours)
      const mockDate = new Date('2024-01-01T20:00:00-03:00');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
      jest.spyOn(mockDate, 'getDay').mockReturnValue(1);
      jest.spyOn(mockDate, 'getFullYear').mockReturnValue(2024);

      await expect(service.resolverDerivacion(mockBody)).rejects.toThrow(
        NotFoundException,
      );

      jest.restoreAllMocks();
    });
  });

  describe('coincideCampo', () => {
    it('should return true when field contains *', () => {
      const serviceAny = service as any;
      expect(serviceAny.coincideCampo('*', 'ANY')).toBe(true);
      expect(serviceAny.coincideCampo('VAL1,*,VAL2', 'ANY')).toBe(true);
    });

    it('should return false when field contains exclusion !', () => {
      const serviceAny = service as any;
      expect(serviceAny.coincideCampo('!VAL1', 'VAL1')).toBe(false);
      expect(serviceAny.coincideCampo('VAL1,!VAL2,VAL3', 'VAL2')).toBe(false);
    });

    it('should return true when value is in the list', () => {
      const serviceAny = service as any;
      expect(serviceAny.coincideCampo('VAL1', 'VAL1')).toBe(true);
      expect(serviceAny.coincideCampo('VAL1,VAL2,VAL3', 'VAL2')).toBe(true);
    });

    it('should return false when value is not in the list', () => {
      const serviceAny = service as any;
      expect(serviceAny.coincideCampo('VAL1,VAL2', 'VAL3')).toBe(false);
    });

    it('should return false when field is null or empty', () => {
      const serviceAny = service as any;
      expect(serviceAny.coincideCampo(null, 'VAL1')).toBe(false);
      expect(serviceAny.coincideCampo('', 'VAL1')).toBe(false);
    });
  });

  describe('getFeriados', () => {
    it('should return empty array when xml is not provided', async () => {
      const serviceAny = service as any;
      const result = await serviceAny.getFeriados(null);
      expect(result).toEqual([]);
    });

    it('should parse feriados XML correctly', async () => {
      const xml = `
        <Campos>
          <row>
            <col name="F">01/01</col>
            <col name="FF">01/01</col>
            <col name="HI">00:00</col>
            <col name="HF">23:59</col>
          </row>
        </Campos>
      `;

      const serviceAny = service as any;
      const mockDate = new Date();
      jest.spyOn(mockDate, 'getFullYear').mockReturnValue(2024);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = await serviceAny.getFeriados(xml);

      expect(result).toHaveLength(1);
      expect(result[0].inicio).toBeInstanceOf(Date);
      expect(result[0].fin).toBeInstanceOf(Date);

      jest.restoreAllMocks();
    });

    it('should handle multiple feriados', async () => {
      const xml = `
        <Campos>
          <row>
            <col name="F">01/01</col>
            <col name="FF">01/01</col>
            <col name="HI">00:00</col>
            <col name="HF">23:59</col>
          </row>
          <row>
            <col name="F">25/12</col>
            <col name="FF">25/12</col>
            <col name="HI">00:00</col>
            <col name="HF">23:59</col>
          </row>
        </Campos>
      `;

      const serviceAny = service as any;
      const mockDate = new Date();
      jest.spyOn(mockDate, 'getFullYear').mockReturnValue(2024);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = await serviceAny.getFeriados(xml);

      expect(result).toHaveLength(2);

      jest.restoreAllMocks();
    });
  });
});
