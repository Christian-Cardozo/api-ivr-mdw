import { Test, TestingModule } from '@nestjs/testing';
import { MulesoftCustomerMsController } from './mulesoft-customer-ms.controller';
import { MulesoftCustomerMsService } from './mulesoft-customer-ms.service';

describe('MulesoftCustomerMsController', () => {
  let mulesoftCustomerMsController: MulesoftCustomerMsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MulesoftCustomerMsController],
      providers: [MulesoftCustomerMsService],
    }).compile();

    mulesoftCustomerMsController = app.get<MulesoftCustomerMsController>(MulesoftCustomerMsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(mulesoftCustomerMsController.getHello()).toBe('Hello World!');
    });
  });
});
