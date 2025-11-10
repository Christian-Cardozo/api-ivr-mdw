import { Test, TestingModule } from '@nestjs/testing';
import { XscaleController } from '../xscale.controller';
import { XscaleService } from '../xscale.service';

describe('XscaleController', () => {
  let controller: XscaleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [XscaleController],
      providers: [XscaleService],
    }).compile();

    controller = module.get<XscaleController>(XscaleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
