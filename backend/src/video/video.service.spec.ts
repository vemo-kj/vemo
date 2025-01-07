import { Test, TestingModule } from '@nestjs/testing';
import { VideoService } from './video.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Video } from './video.entity';
import { Repository } from 'typeorm';
import { YoutubeAuthService } from '../youtubeauth/youtube-auth.service';
import { ChannelService } from '../channel/channel.service';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('VideoService', () => {
    let service: VideoService;
    let videoRepository: Repository<Video>;
    let channelService: ChannelService;
    let cacheManager: Cache;
    let mockRedisClient: any;

    beforeEach(async () => {
        mockRedisClient = {
            zscore: jest.fn().mockImplementation(() => Promise.resolve('5')),
            zadd: jest.fn().mockImplementation(() => Promise.resolve('1')),
            zrevrange: jest.fn().mockImplementation(() => Promise.resolve([])),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VideoService,
                {
                    provide: getRepositoryToken(Video),
                    useValue: {
                        findOne: jest.fn(),
                        create: jest.fn(),
                        save: jest.fn(),
                    },
                },
                {
                    provide: YoutubeAuthService,
                    useValue: {
                        youtube: {
                            videos: {
                                list: jest.fn(),
                            },
                        },
                    },
                },
                {
                    provide: ChannelService,
                    useValue: {
                        getChannel: jest.fn(),
                    },
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: {
                        get: jest.fn(),
                        set: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<VideoService>(VideoService);
        videoRepository = module.get<Repository<Video>>(getRepositoryToken(Video));
        channelService = module.get<ChannelService>(ChannelService);
        cacheManager = module.get(CACHE_MANAGER);

        // Redis 클라이언트 설정
        Object.defineProperty(service, 'redisClient', {
            value: mockRedisClient,
            writable: true,
            configurable: true,
        });
    });

    describe('비디오 요청 카운트 증가', () => {
        it('비디오 요청 시 카운트가 증가해야 한다', async () => {
            const videoId = 'test-video-id';
            mockRedisClient.zscore.mockImplementation(() => Promise.resolve('5'));
            mockRedisClient.zadd.mockImplementation(() => Promise.resolve('1'));

            await service.incrementVideoRequestCount(videoId);

            expect(mockRedisClient.zscore).toHaveBeenCalledWith('video:requestCounts', videoId);
            expect(mockRedisClient.zadd).toHaveBeenCalledWith('video:requestCounts', 6, videoId);
        });

        it('Redis 오류 발생 시 서버 에러를 반환해야 한다', async () => {
            const videoId = 'test-video-id';
            mockRedisClient.zscore.mockImplementation(() =>
                Promise.reject(new Error('Redis Error')),
            );

            await expect(service.incrementVideoRequestCount(videoId)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('비디오 데이터 조회', () => {
        it('캐시된 데이터가 있으면 캐시에서 반환해야 한다', async () => {
            const videoId = 'cached-video';
            const cachedData = { id: videoId, title: '캐시된 비디오' };
            jest.spyOn(cacheManager, 'get').mockImplementation(() => Promise.resolve(cachedData));

            const result = await service.getVideoData(videoId);

            expect(result).toEqual(cachedData);
            expect(videoRepository.findOne).not.toHaveBeenCalled();
        });

        it('캐시 미스 시 DB에서 조회하고 캐시에 저장해야 한다', async () => {
            const videoId = 'non-cached-video';
            const dbVideo = { id: videoId, title: 'DB 비디오' };

            jest.spyOn(cacheManager, 'get').mockImplementation(() => Promise.resolve(null));
            jest.spyOn(service as any, 'findVideoInDatabase').mockImplementation(() =>
                Promise.resolve(dbVideo),
            );

            const result = await service.getVideoData(videoId);

            expect(result.id).toEqual(videoId);
            expect(cacheManager.set).toHaveBeenCalled();
        });

        it('DB에 없는 비디오는 YouTube API에서 가져와야 한다', async () => {
            const videoId = 'youtube-video';
            const youtubeData = {
                id: videoId,
                snippet: { title: 'YouTube 비디오' },
                contentDetails: { duration: 'PT1H' },
            };
            const savedVideo = { id: videoId, title: 'YouTube 비디오' };

            jest.spyOn(cacheManager, 'get').mockImplementation(() => Promise.resolve(null));
            jest.spyOn(service as any, 'findVideoInDatabase').mockImplementation(() =>
                Promise.resolve(null),
            );
            jest.spyOn(service as any, 'fetchVideoFromYouTube').mockImplementation(() =>
                Promise.resolve(youtubeData),
            );
            jest.spyOn(service as any, 'createAndSaveVideo').mockImplementation(() =>
                Promise.resolve(savedVideo),
            );

            const result = await service.getVideoData(videoId);

            expect(result).toEqual(savedVideo);
            expect(service['fetchVideoFromYouTube']).toHaveBeenCalledWith(videoId);
            expect(service['createAndSaveVideo']).toHaveBeenCalledWith(youtubeData);
        });

        it('존재하지 않는 비디오 ID로 요청 시 NotFoundException을 던져야 한다', async () => {
            const videoId = 'non-existent';
            jest.spyOn(cacheManager, 'get').mockImplementation(() => Promise.resolve(null));
            jest.spyOn(service as any, 'findVideoInDatabase').mockImplementation(() =>
                Promise.resolve(null),
            );
            jest.spyOn(service as any, 'fetchVideoFromYouTube').mockImplementation(() =>
                Promise.resolve(null),
            );

            await expect(service.getVideoData(videoId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('인기 비디오 조회', () => {
        it('가장 많이 요청된 상위 비디오를 반환해야 한다', async () => {
            const topVideos = ['video1', 'video2', 'video3'];
            mockRedisClient.zrevrange.mockImplementation(() => Promise.resolve(topVideos));

            const result = await service.getTopRequestedVideos(3);

            expect(result).toEqual(topVideos);
            expect(mockRedisClient.zrevrange).toHaveBeenCalledWith('video:requestCounts', 0, 2);
        });

        it('Redis 오류 발생 시 서버 에러를 반환해야 한다', async () => {
            mockRedisClient.zrevrange.mockImplementation(() =>
                Promise.reject(new Error('Redis Error')),
            );

            await expect(service.getTopRequestedVideos(3)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('캐시 갱신', () => {
        it('상위 요청된 비디오들의 캐시를 갱신해야 한다', async () => {
            const topVideos = ['video1', 'video2'];
            const videoData = { id: 'video1', title: '인기 비디오' };

            mockRedisClient.zrevrange.mockImplementation(() => Promise.resolve(topVideos));
            jest.spyOn(service, 'getVideoData').mockImplementation(() =>
                Promise.resolve(videoData),
            );

            await service.cacheTopRequestedVideos();

            expect(service.getVideoData).toHaveBeenCalledTimes(topVideos.length);
            expect(service.getVideoData).toHaveBeenCalledWith(topVideos[0]);
        });
    });
});
