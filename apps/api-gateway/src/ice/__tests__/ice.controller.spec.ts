import { Test, TestingModule } from '@nestjs/testing';
import { IceController } from './ice.controller';
import { IceService } from './ice.service';

describe('IceController', () => {
  let controller: IceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IceController],
      providers: [IceService],
    }).compile();

    controller = module.get<IceController>(IceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
