import { Test, TestingModule } from '@nestjs/testing';
import { CustomerCareService } from '../customer-care.service';

describe('CustomerCareService', () => {
  let service: CustomerCareService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomerCareService],
    }).compile();

    service = module.get<CustomerCareService>(CustomerCareService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
