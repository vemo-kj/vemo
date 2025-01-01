import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeAuthService } from './youtube-auth.service';

describe('YoutubeAuthService', () => {
    let service: YoutubeAuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [YoutubeAuthService],
        }).compile();

        service = module.get<YoutubeAuthService>(YoutubeAuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
