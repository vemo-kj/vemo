import { Test, TestingModule } from '@nestjs/testing';
import { CapturesService } from './captures.service';

describe('CapturesService', () => {
  let service: CapturesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CapturesService],
    }).compile();

    service = module.get<CapturesService>(CapturesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
