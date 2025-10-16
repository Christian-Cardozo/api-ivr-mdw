import { Test, TestingModule } from '@nestjs/testing';
import { MulesoftController } from '../mulesoft.controller';
import { MulesoftService } from '../mulesoft.service';
import { of } from 'rxjs';
import { MulesoftController } from '../mulesoft.controller';
import { MulesoftService } from '../mulesoft.service';
import { of } from 'rxjs';

describe('MulesoftController', () => {
  let controller: MulesoftController;
  const serviceMock = {
    getMulesoftCustomerByANI: jest.fn(),
    getMulesoftCustomerByDNI: jest.fn(),
    getMulesoftCancellation: jest.fn(),
  } as jest.Mocked<Pick<MulesoftService, 'getMulesoftCustomerByANI' | 'getMulesoftCustomerByDNI' | 'getMulesoftCancellation'>>;
  const serviceMock = {
    getMulesoftCustomerByANI: jest.fn(),
    getMulesoftCustomerByDNI: jest.fn(),
    getMulesoftCancellation: jest.fn(),
  } as jest.Mocked<Pick<MulesoftService, 'getMulesoftCustomerByANI' | 'getMulesoftCustomerByDNI' | 'getMulesoftCancellation'>>;

  beforeEach(async () => {
    serviceMock.getMulesoftCustomerByANI.mockReset();
    serviceMock.getMulesoftCustomerByDNI.mockReset();
    serviceMock.getMulesoftCancellation.mockReset();

    serviceMock.getMulesoftCustomerByANI.mockReset();
    serviceMock.getMulesoftCustomerByDNI.mockReset();
    serviceMock.getMulesoftCancellation.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MulesoftController],      
      providers: [
        {
          provide: MulesoftService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<MulesoftController>(MulesoftController);
  });
  
  it('should return the observable from the service when searching by ANI', async () => {
    const response$ = of('xml');
    serviceMock.getMulesoftCustomerByANI.mockReturnValue(response$);

    const result = await controller.getMulesoftCustomerByANI({ ani: '123' });

    expect(serviceMock.getMulesoftCustomerByANI).toHaveBeenCalledWith('123');
    expect(result).toBe(response$);
  });

  it('should return the observable from the service when searching by DNI', async () => {
    const response$ = of('xml');
    serviceMock.getMulesoftCustomerByDNI.mockReturnValue(response$ as any);

    const result = await controller.getMulesoftCustomerByDNI({ dni: '98765432' });

    expect(serviceMock.getMulesoftCustomerByDNI).toHaveBeenCalledWith('98765432');
    expect(result).toBe(response$);
  });

  it('should delegate cancellations to the service', async () => {
    const params = {
      xcorrelationid: 'corr-1',
      currentapplication: 'ivr',
      currentcomponent: 'middleware',
      action: 'accept' as const,
    };
    const body = { foo: 'bar' };
    serviceMock.getMulesoftCancellation.mockResolvedValue({ ok: true });

    const result = await controller.getMulesoftCancellation(params, body);

    expect(serviceMock.getMulesoftCancellation).toHaveBeenCalledWith(params, body);
    expect(result).toEqual({ ok: true });
  });
});