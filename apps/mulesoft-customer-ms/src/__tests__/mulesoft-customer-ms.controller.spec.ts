import { Test, TestingModule } from '@nestjs/testing';
import { MulesoftCustomerMsController } from '../mulesoft-customer-ms.controller';
import { MulesoftCustomerMsService } from '../mulesoft-customer-ms.service';

describe('MulesoftCustomerMsController', () => {
  let controller: MulesoftCustomerMsController;
  const serviceMock = {
    getByANI: jest.fn(),
    getByDNI: jest.fn(),
  } as jest.Mocked<MulesoftCustomerMsService>;

  beforeEach(async () => {
    serviceMock.getByANI.mockReset();
    serviceMock.getByDNI.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MulesoftCustomerMsController],
      providers: [
        {
          provide: MulesoftCustomerMsService,
          useValue: serviceMock,
        },
      ],
    }).compile();

    controller = module.get<MulesoftCustomerMsController>(MulesoftCustomerMsController);
  });

  it('should delegate ANI lookups to the service', async () => {
    serviceMock.getByANI.mockResolvedValue('ani-response' as any);

    const result = await controller.getCustomerByANI('123');

    expect(serviceMock.getByANI).toHaveBeenCalledWith('123');
    expect(result).toBe('ani-response');
  });

  it('should delegate DNI lookups to the service', async () => {
    serviceMock.getByDNI.mockResolvedValue('dni-response' as any);

    const result = await controller.getCustomerByDNI('999');

    expect(serviceMock.getByDNI).toHaveBeenCalledWith('999');
    expect(result).toBe('dni-response');
  });
});
