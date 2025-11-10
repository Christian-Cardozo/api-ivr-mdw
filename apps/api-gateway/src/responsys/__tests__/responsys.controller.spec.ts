import { Test, TestingModule } from '@nestjs/testing';
import { ResponsysController } from '../responsys.controller';
import { ResponsysService } from '../responsys.service';

describe('ResponsysController', () => {
  let controller: ResponsysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResponsysController],
      providers: [ResponsysService],
    }).compile();

    controller = module.get<ResponsysController>(ResponsysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
