import { Test, TestingModule } from '@nestjs/testing';
import { IvrController } from './ivr.controller';
import { IvrService } from './ivr.service';

describe('IvrController', () => {
  let controller: IvrController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IvrController],
      providers: [IvrService],
    }).compile();

    controller = module.get<IvrController>(IvrController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
