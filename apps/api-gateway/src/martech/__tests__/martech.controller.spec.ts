import { Test, TestingModule } from '@nestjs/testing';
import { MartechController } from '../martech.controller';
import { MartechService } from '../martech.service';

describe('MartechController', () => {
  let controller: MartechController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MartechController],
      providers: [MartechService],
    }).compile();

    controller = module.get<MartechController>(MartechController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
