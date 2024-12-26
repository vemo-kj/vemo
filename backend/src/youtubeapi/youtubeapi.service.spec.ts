import { Test, TestingModule } from '@nestjs/testing';
import { YoutubeapiService } from './youtubeapi.service';

describe('YoutubeapiService', () => {
    let service: YoutubeapiService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [YoutubeapiService],
        }).compile();

        service = module.get<YoutubeapiService>(YoutubeapiService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
