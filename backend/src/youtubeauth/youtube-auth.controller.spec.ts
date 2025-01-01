import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeAuthController } from './youtube-auth.controller';

describe('YoutubeAuthController', () => {
    let controller: YoutubeAuthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [YoutubeAuthController],
        }).compile();

        controller = module.get<YoutubeAuthController>(YoutubeAuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
