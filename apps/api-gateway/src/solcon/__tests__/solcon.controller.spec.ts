import { Test, TestingModule } from '@nestjs/testing';
import { SolconController } from '../solcon.controller';
import { SolconService } from '../solcon.service';

describe('SolconController', () => {
  let controller: SolconController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolconController],
      providers: [SolconService],
    }).compile();

    controller = module.get<SolconController>(SolconController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
