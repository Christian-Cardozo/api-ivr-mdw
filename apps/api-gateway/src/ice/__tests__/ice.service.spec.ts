import { Test, TestingModule } from '@nestjs/testing';
import { IceService } from './ice.service';

describe('IceService', () => {
  let service: IceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IceService],
    }).compile();

    service = module.get<IceService>(IceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
