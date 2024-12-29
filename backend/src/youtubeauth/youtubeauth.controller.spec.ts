import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeauthController } from './youtubeauth.controller';

describe('YoutubeauthController', () => {
  let controller: YoutubeauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeauthController],
    }).compile();

    controller = module.get<YoutubeauthController>(YoutubeauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
