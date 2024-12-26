import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeapiController } from './youtubeapi.controller';

describe('YoutubeapiController', () => {
  let controller: YoutubeapiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YoutubeapiController],
    }).compile();

    controller = module.get<YoutubeapiController>(YoutubeapiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
