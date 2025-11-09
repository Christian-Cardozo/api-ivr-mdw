import { Test, TestingModule } from '@nestjs/testing';
import { CustomerCareController } from '../customer-care.controller';
import { CustomerCareService } from '../customer-care.service';

describe('CustomerCareController', () => {
  let controller: CustomerCareController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomerCareController],
      providers: [CustomerCareService],
    }).compile();

    controller = module.get<CustomerCareController>(CustomerCareController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
