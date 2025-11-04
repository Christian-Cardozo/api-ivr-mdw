import { Test, TestingModule } from '@nestjs/testing';
import { MulesoftDigitalBillingMsController } from '../mulesoft-digital-billing-ms.controller';
import { MulesoftDigitalBillingMsService } from '../mulesoft-digital-billing-ms.service';

describe('MulesoftDigitalBillingMsController', () => {
  let mulesoftDigitalBillingMsController: MulesoftDigitalBillingMsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [MulesoftDigitalBillingMsController],
      providers: [MulesoftDigitalBillingMsService],
    }).compile();

    mulesoftDigitalBillingMsController = app.get<MulesoftDigitalBillingMsController>(MulesoftDigitalBillingMsController);
  });
  
});
