import { Test, TestingModule } from '@nestjs/testing';
import { ChannelService } from './channel.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Channel } from './channel.entity';
import { NotFoundException } from '@nestjs/common';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';

describe('ChannelService', () => {
    let service: ChannelService;
    let channelRepository: Repository<Channel>;

    const mockChannel = {
        id: 'channel-1',
        title: 'Test Channel',
        thumbnails: 'https://example.com/thumbnail.jpg',
        videos: [],
    } as Channel;

    const mockYoutubeAuthService = {
        youtube: {
            channels: {
                list: jest.fn(),
            },
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ChannelService,
                {
                    provide: getRepositoryToken(Channel),
                    useValue: {
                        findOne: jest.fn(),
                        save: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: YoutubeAuthService,
                    useValue: mockYoutubeAuthService,
                },
            ],
        }).compile();

        service = module.get<ChannelService>(ChannelService);
        channelRepository = module.get<Repository<Channel>>(getRepositoryToken(Channel));
    });

    describe('getChannel', () => {
        it('존재하는 채널을 조회해야 한다', async () => {
            const channelId = 'channel-1';

            jest.spyOn(channelRepository, 'findOne').mockResolvedValue(mockChannel);

            const result = await service.getChannel(channelId);

            expect(channelRepository.findOne).toHaveBeenCalledWith({
                where: { id: channelId },
            });
            expect(result).toEqual(mockChannel);
            expect(mockYoutubeAuthService.youtube.channels.list).not.toHaveBeenCalled();
        });

        it('존재하지 않는 채널을 조회하면 YouTube API를 통해 채널을 생성해야 한다', async () => {
            const channelId = 'new-channel';
            const mockYoutubeResponse = {
                data: {
                    items: [
                        {
                            id: channelId,
                            snippet: {
                                title: 'New Channel',
                                thumbnails: {
                                    high: {
                                        url: 'https://example.com/new-thumbnail.jpg',
                                    },
                                },
                            },
                        },
                    ],
                },
            };

            const newChannel = {
                id: channelId,
                title: 'New Channel',
                thumbnails: 'https://example.com/new-thumbnail.jpg',
                videos: [],
            } as Channel;

            jest.spyOn(channelRepository, 'findOne').mockResolvedValue(null);
            mockYoutubeAuthService.youtube.channels.list.mockResolvedValue(mockYoutubeResponse);
            jest.spyOn(channelRepository, 'create').mockReturnValue(newChannel);
            jest.spyOn(channelRepository, 'save').mockResolvedValue(newChannel);

            const result = await service.getChannel(channelId);

            expect(channelRepository.findOne).toHaveBeenCalledWith({
                where: { id: channelId },
            });
            expect(mockYoutubeAuthService.youtube.channels.list).toHaveBeenCalledWith({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: [channelId],
            });
            expect(result).toEqual(newChannel);
        });

        it('YouTube API에서 채널을 찾을 수 없으면 NotFoundException을 던져야 한다', async () => {
            const channelId = 'non-existent-channel';
            const mockYoutubeResponse = {
                data: {
                    items: [],
                },
            };

            jest.spyOn(channelRepository, 'findOne').mockResolvedValue(null);
            mockYoutubeAuthService.youtube.channels.list.mockResolvedValue(mockYoutubeResponse);

            await expect(service.getChannel(channelId)).rejects.toThrow(NotFoundException);
            expect(channelRepository.findOne).toHaveBeenCalledWith({
                where: { id: channelId },
            });
            expect(mockYoutubeAuthService.youtube.channels.list).toHaveBeenCalledWith({
                part: ['snippet', 'contentDetails', 'statistics'],
                id: [channelId],
            });
        });
    });
});
