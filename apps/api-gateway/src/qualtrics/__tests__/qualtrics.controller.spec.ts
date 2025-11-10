import { Test, TestingModule } from '@nestjs/testing';
import { QualtricsController } from '../qualtrics.controller';
import { QualtricsService } from '../qualtrics.service';

describe('QualtricsController', () => {
  let controller: QualtricsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualtricsController],
      providers: [QualtricsService],
    }).compile();

    controller = module.get<QualtricsController>(QualtricsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
