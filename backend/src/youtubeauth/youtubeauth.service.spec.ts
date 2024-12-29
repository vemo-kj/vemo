import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeauthService } from './youtubeauth.service';

describe('YoutubeauthService', () => {
  let service: YoutubeauthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YoutubeauthService],
    }).compile();

    service = module.get<YoutubeauthService>(YoutubeauthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
