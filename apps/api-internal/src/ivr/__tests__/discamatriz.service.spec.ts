import { Test, TestingModule } from '@nestjs/testing';
import { DiscamatrizService } from '../discamatriz/discamatriz.service';

describe('DiscamatrizService', () => {
  let service: DiscamatrizService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiscamatrizService],
    }).compile();

    service = module.get<DiscamatrizService>(DiscamatrizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
