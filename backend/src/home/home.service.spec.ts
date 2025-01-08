import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { HomeService } from './home.service';
import { VideoService } from '../video/video.service';
import { MemosService } from '../memos/memos.service';
import { PlaylistService } from '../playlist/playlist.service';
import { Video } from '../video/video.entity';
import { Channel } from '../channel/channel.entity';
import { Memos } from '../memos/memos.entity';
import { CreatePlaylistWithMemosDto } from './dto/create-playlist-with-memos.dto';
import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';

describe('HomeService', () => {
    let service: HomeService;
    let videoService: jest.Mocked<VideoService>;
    let memosService: jest.Mocked<MemosService>;
    let playlistService: jest.Mocked<PlaylistService>;

    const mockChannel: Channel = {
        id: 'channel1',
        title: 'Test Channel',
        thumbnails: 'channel-thumbnail.jpg',
        videos: [],
    };

    const mockVideo: Video = {
        id: 'video1',
        title: 'Test Video',
        thumbnails: 'video-thumbnail.jpg',
        duration: '01:30:00',
        category: 'Education',
        channel: mockChannel,
        playlists: [],
    };

    const mockMemos: Memos = {
        id: 1,
        title: 'Test Memo',
        createdAt: new Date(),
        user: null,
        video: mockVideo,
        memo: [],
        capture: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HomeService,
                {
                    provide: VideoService,
                    useValue: {
                        getVideoById: jest.fn(),
                        getAllVideos: jest.fn(),
                    },
                },
                {
                    provide: MemosService,
                    useValue: {
                        createMemos: jest.fn(),
                        getMemosByVideoAndUser: jest.fn(),
                        getVemoCountByVideo: jest.fn(),
                    },
                },
                {
                    provide: PlaylistService,
                    useValue: {
                        createPlaylist: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<HomeService>(HomeService);
        videoService = module.get(VideoService);
        memosService = module.get(MemosService);
        playlistService = module.get(PlaylistService);
    });

    describe('createPlaylistWithMemos', () => {
        it('플레이리스트와 첫 번째 비디오에 대한 메모를 생성해야 한다', async () => {
            const userId = 1;
            const createPlaylistDto: CreatePlaylistWithMemosDto = {
                name: 'Test Playlist',
                videoIds: ['video1', 'video2'],
            };

            const mockPlaylistResponse: PlaylistResponseDto = {
                id: 1,
                name: createPlaylistDto.name,
                userId: userId,
                videos: [mockVideo].map(video => ({
                    id: video.id,
                    title: video.title,
                    thumbnails: video.thumbnails,
                    duration: video.duration,
                    channel: {
                        id: video.channel.id,
                        title: video.channel.title,
                        thumbnails: video.channel.thumbnails,
                    },
                    category: video.category,
                })),
            };

            playlistService.createPlaylist.mockResolvedValue(mockPlaylistResponse);
            videoService.getVideoById.mockResolvedValue(mockVideo);
            memosService.createMemos.mockResolvedValue(mockMemos);

            const result = await service.createPlaylistWithMemos(userId, createPlaylistDto);

            expect(playlistService.createPlaylist).toHaveBeenCalledWith(createPlaylistDto, userId);
            expect(videoService.getVideoById).toHaveBeenCalledWith(createPlaylistDto.videoIds[0]);
            expect(memosService.createMemos).toHaveBeenCalledWith(
                mockVideo.title,
                createPlaylistDto.videoIds[0],
                userId,
            );
            expect(result).toEqual({
                playlistId: mockPlaylistResponse.id,
                videoId: mockVideo.id,
            });
        });
    });

    describe('createOrGetLatestMemos', () => {
        const userId = 1;
        const videoId = 'video1';

        it('기존 메모가 없을 경우 새로운 메모를 생성해야 한다', async () => {
            memosService.getMemosByVideoAndUser.mockResolvedValue([]);
            videoService.getVideoById.mockResolvedValue(mockVideo);
            memosService.createMemos.mockResolvedValue(mockMemos);

            const result = await service.createOrGetLatestMemos(userId, videoId);

            expect(memosService.getMemosByVideoAndUser).toHaveBeenCalledWith(videoId, userId);
            expect(videoService.getVideoById).toHaveBeenCalledWith(videoId);
            expect(memosService.createMemos).toHaveBeenCalledWith(mockVideo.title, videoId, userId);
            expect(result).toEqual({
                id: mockMemos.id,
                title: mockMemos.title,
                createdAt: mockMemos.createdAt,
            });
        });

        it('기존 메모가 있을 경우 최신 메모를 반환해야 한다', async () => {
            memosService.getMemosByVideoAndUser.mockResolvedValue([mockMemos]);

            const result = await service.createOrGetLatestMemos(userId, videoId);

            expect(memosService.getMemosByVideoAndUser).toHaveBeenCalledWith(videoId, userId);
            expect(videoService.getVideoById).not.toHaveBeenCalled();
            expect(memosService.createMemos).not.toHaveBeenCalled();
            expect(result).toEqual({
                id: mockMemos.id,
                title: mockMemos.title,
                createdAt: mockMemos.createdAt,
            });
        });

        it('비디오를 찾을 수 없을 경우 NotFoundException을 던져야 한다', async () => {
            memosService.getMemosByVideoAndUser.mockResolvedValue([]);
            videoService.getVideoById.mockRejectedValue(new NotFoundException());

            await expect(service.createOrGetLatestMemos(userId, videoId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getAllVideos', () => {
        it('비디오 목록과 각 비디오의 메모 수를 반환해야 한다', async () => {
            const mockVideos = [mockVideo];
            const mockVemoCount = 5;

            videoService.getAllVideos.mockResolvedValue(mockVideos);
            memosService.getVemoCountByVideo.mockResolvedValue(mockVemoCount);

            const result = await service.getAllVideos(1, 10);

            expect(videoService.getAllVideos).toHaveBeenCalledWith(1, 10);
            expect(memosService.getVemoCountByVideo).toHaveBeenCalledWith(mockVideo.id);
            expect(result).toEqual({
                videos: [
                    {
                        id: mockVideo.id,
                        title: mockVideo.title,
                        thumbnails: mockVideo.thumbnails,
                        duration: mockVideo.duration,
                        category: mockVideo.category,
                        channel: {
                            id: mockVideo.channel.id,
                            thumbnails: mockVideo.channel.thumbnails,
                            title: mockVideo.channel.title,
                        },
                        vemoCount: mockVemoCount,
                    },
                ],
            });
        });

        it('비디오가 없을 경우 NotFoundException을 던져야 한다', async () => {
            videoService.getAllVideos.mockResolvedValue([]);

            await expect(service.getAllVideos(1, 10)).rejects.toThrow(NotFoundException);
        });
    });
});
