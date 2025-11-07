import { Test, TestingModule } from '@nestjs/testing';
import { ApiInternalController } from '../api-internal.controller';
import { ApiInternalService } from '../api-internal.service';

describe('ApiInternalController', () => {
  let apiInternalController: ApiInternalController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ApiInternalController],
      providers: [ApiInternalService],
    }).compile();

    apiInternalController = app.get<ApiInternalController>(ApiInternalController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(apiInternalController.getHello()).toBe('Hello World!');
    });
  });
});
