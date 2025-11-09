import { Test, TestingModule } from '@nestjs/testing';
import { AmazonController } from './amazon.controller';
import { AmazonService } from './amazon.service';

describe('AmazonController', () => {
  let controller: AmazonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmazonController],
      providers: [AmazonService],
    }).compile();

    controller = module.get<AmazonController>(AmazonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
