import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoService } from './video.service';
import { ChannelService } from '../channel/channel.service';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';
import { Video } from './video.entity';
import { Channel } from '../channel/channel.entity';

describe('VideoService', () => {
    let service: VideoService;
    let videoRepository: jest.Mocked<Repository<Video>>;
    let channelService: jest.Mocked<ChannelService>;

    const mockVideoId = 'dQw4w9WgXcQ';
    const mockChannelId = 'UCuAXFkgsw1L7xaCfnd5JJOw';

    const mockChannel: Channel = {
        id: mockChannelId,
        title: 'Test Channel',
        thumbnails: 'channel-thumbnail.jpg',
        videos: [],
    };

    const mockVideo: Video = {
        id: mockVideoId,
        title: 'Test Video',
        thumbnails: 'video-thumbnail.jpg',
        duration: '01:30:00',
        category: 'Education',
        channel: mockChannel,
        playlists: [],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VideoService,
                {
                    provide: getRepositoryToken(Video),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                    },
                },
                {
                    provide: YoutubeAuthService,
                    useValue: {
                        youtube: {},
                    },
                },
                {
                    provide: ChannelService,
                    useValue: {
                        getChannel: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<VideoService>(VideoService);
        videoRepository = module.get(getRepositoryToken(Video));
        channelService = module.get(ChannelService);
    });

    describe('findVideoInDatabase', () => {
        it('DB에서 비디오를 찾으면 해당 비디오를 반환해야 한다', async () => {
            videoRepository.findOne.mockResolvedValue(mockVideo);

            const result = await service.findVideoInDatabase(mockVideoId);

            expect(result).toEqual(mockVideo);
            expect(videoRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockVideoId },
                relations: ['channel'],
            });
        });

        it('DB에서 비디오를 찾지 못하면 null을 반환해야 한다', async () => {
            videoRepository.findOne.mockResolvedValue(null);

            const result = await service.findVideoInDatabase(mockVideoId);

            expect(result).toBeNull();
            expect(videoRepository.findOne).toHaveBeenCalledWith({
                where: { id: mockVideoId },
                relations: ['channel'],
            });
        });
    });

    describe('getAllVideos', () => {
        it('페이지네이션과 함께 모든 비디오를 반환해야 한다', async () => {
            const mockVideos = [mockVideo];
            videoRepository.find.mockResolvedValue(mockVideos);

            const result = await service.getAllVideos(1, 10);

            expect(result).toEqual(mockVideos);
            expect(videoRepository.find).toHaveBeenCalledWith({
                relations: ['channel'],
                order: { id: 'DESC' },
                skip: 0,
                take: 10,
            });
        });
    });

    describe('parseDuration', () => {
        it('YouTube 시간 형식을 올바르게 파싱해야 한다', () => {
            const testCases = [
                { input: 'PT1H30M', expected: '01:30:00' },
                { input: 'PT45M', expected: '00:45:00' },
                { input: 'PT2H', expected: '02:00:00' },
                { input: 'PT30S', expected: '00:00:30' },
                { input: 'PT1H30M15S', expected: '01:30:15' },
            ];

            testCases.forEach(({ input, expected }) => {
                const result = service['parseDuration'](input);
                expect(result).toBe(expected);
            });
        });
    });
});
