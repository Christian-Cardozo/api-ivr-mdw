import { Test, TestingModule } from '@nestjs/testing';
import { MulesoftController } from './mulesoft.controller';
import { MulesoftService } from './mulesoft.service';

describe('MulesoftController', () => {
  let controller: MulesoftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MulesoftController],
      providers: [MulesoftService],
    }).compile();

    controller = module.get<MulesoftController>(MulesoftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
