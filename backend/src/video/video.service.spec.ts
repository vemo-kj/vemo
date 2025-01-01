import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { VideoService } from './video.service';
import { ChannelService } from '../channel/channel.service';
import { YoutubeauthService } from '../youtubeauth/youtubeauth.service';
import { Video } from './video.entity';
import { Channel } from '../channel/channel.entity';

const mockVideoRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
};

const mockYoutubeauthService = {
    ensureAuthenticated: jest.fn(),
    youtube: {
        videos: {
            list: jest.fn(),
        },
    },
};

const mockChannelService = {
    getChannel: jest.fn(),
};

describe('VideoService', () => {
    let service: VideoService;
    let videoRepository: jest.Mocked<Repository<Video>>;
    let youtubeauthService: typeof mockYoutubeauthService;
    let channelService: typeof mockChannelService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VideoService,
                { provide: getRepositoryToken(Video), useValue: mockVideoRepository },
                { provide: YoutubeauthService, useValue: mockYoutubeauthService },
                { provide: ChannelService, useValue: mockChannelService },
            ],
        }).compile();

        service = module.get<VideoService>(VideoService);
        videoRepository = module.get(getRepositoryToken(Video));
        youtubeauthService = module.get(YoutubeauthService);
        channelService = module.get(ChannelService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getVideoById', () => {
        it('DB에 비디오가 존재하면 해당 비디오를 반환해야 한다', async () => {
            const mockChannel: Channel = {
                id: '456',
                thumbnails: 'channel-thumbnail',
                title: 'Test Channel',
                videos: [],
            };

            const mockVideo: Video = {
                id: '123',
                title: 'Test Video',
                thumbnails: 'test-thumbnail',
                duration: '00:10:00',
                category: 'Test Category',
                playlists: [],
                channel: mockChannel,
            };
            videoRepository.findOne.mockResolvedValue(mockVideo);

            const result = await service.getVideoById('123');

            expect(result).toEqual(mockVideo);
            expect(videoRepository.findOne).toHaveBeenCalledWith({
                where: { id: '123' },
                relations: ['channel'],
            });
        });

        it('DB에 비디오가 없을 경우 YouTube에서 데이터를 가져와야 한다', async () => {
            videoRepository.findOne.mockResolvedValue(null);
            youtubeauthService.youtube.videos.list.mockResolvedValue({
                data: {
                    items: [
                        {
                            id: '123',
                            snippet: {
                                title: 'Test Video',
                                channelId: '456',
                                thumbnails: { high: { url: 'test-thumbnail' } },
                                categoryId: '789',
                            },
                            contentDetails: {
                                duration: 'PT1H2M3S',
                            },
                        },
                    ],
                },
            });
            channelService.getChannel.mockResolvedValue({
                id: '456',
                thumbnails: 'channel-thumbnail',
                title: 'Test Channel',
            });
            videoRepository.create.mockReturnValue({
                id: '123',
                title: 'Test Video',
                thumbnails: 'test-thumbnail',
                duration: '01:02:03',
                category: '789',
                playlists: [],
                channel: {
                    id: '456',
                    thumbnails: 'channel-thumbnail',
                    title: 'Test Channel',
                },
            } as Video);
            videoRepository.save.mockResolvedValue({
                id: '123',
                title: 'Test Video',
                thumbnails: 'test-thumbnail',
                duration: '01:02:03',
                category: '789',
                playlists: [],
                channel: {
                    id: '456',
                    thumbnails: 'channel-thumbnail',
                    title: 'Test Channel',
                },
            } as Video);

            const result = await service.getVideoById('123');

            expect(result).toEqual({
                id: '123',
                title: 'Test Video',
                thumbnails: 'test-thumbnail',
                duration: '01:02:03',
                category: '789',
                playlists: [],
                channel: {
                    id: '456',
                    thumbnails: 'channel-thumbnail',
                    title: 'Test Channel',
                },
            });
            expect(youtubeauthService.youtube.videos.list).toHaveBeenCalledWith({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: ['123'],
            });
            expect(videoRepository.save).toHaveBeenCalled();
        });

        it('YouTube에서 비디오를 찾을 수 없을 경우 예외를 발생시켜야 한다', async () => {
            videoRepository.findOne.mockResolvedValue(null);
            youtubeauthService.youtube.videos.list.mockResolvedValue({ data: { items: [] } });

            await expect(service.getVideoById('123')).rejects.toThrow(NotFoundException);
        });
    });

    describe('parseDuration', () => {
        it('ISO 8601 형식의 duration을 올바르게 파싱해야 한다', () => {
            const result = service['parseDuration']('PT1H2M3S');
            expect(result).toEqual('01:02:03');
        });

        it('누락된 시간 단위를 처리할 수 있어야 한다', () => {
            const result = service['parseDuration']('PT45M');
            expect(result).toEqual('00:45:00');
        });
    });
});
