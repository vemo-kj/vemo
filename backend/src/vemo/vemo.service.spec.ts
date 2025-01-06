import { Test, TestingModule } from '@nestjs/testing';
import { VemoService } from './vemo.service';
import { MemosService } from '../memos/memos.service';
import { PlaylistService } from '../playlist/playlist.service';
import { Memos } from '../memos/memos.entity';
import { Users } from '../users/users.entity';
import { Playlist } from '../playlist/entities/playlist.entity';
import { PlaylistResponseDto, VideoDto, ChannelDto } from '../playlist/dto/playlist-response.dto';
import { Video } from '../video/video.entity';

describe('VemoService', () => {
    let service: VemoService;
    let memosService: MemosService;
    let playlistService: PlaylistService;

    const mockUser = {
        id: 1,
        nickname: 'testUser',
    } as Users;

    const mockMemos = {
        id: 1,
        title: 'Test Memo',
        createdAt: new Date(),
        user: mockUser,
    } as Memos;

    const mockChannel: ChannelDto = {
        id: 'channel-1',
        title: 'Test Channel',
        thumbnails: 'channel-thumbnail.jpg',
    };

    const mockVideo: VideoDto = {
        id: 'video-1',
        title: 'Test Video',
        thumbnails: 'video-thumbnail.jpg',
        duration: '00:10:00',
        channel: mockChannel,
        category: 'Education',
    };

    const mockVideoEntity = {
        id: 'video-1',
        title: 'Test Video',
    } as Video;

    const mockPlaylistEntity: Playlist = {
        id: 1,
        name: 'Test Playlist',
        user: mockUser,
        videos: [mockVideoEntity],
    };

    const mockPlaylistResponse: PlaylistResponseDto = {
        id: 1,
        name: 'Test Playlist',
        userId: mockUser.id,
        videos: [mockVideo],
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VemoService,
                {
                    provide: MemosService,
                    useValue: {
                        getMemosByVideoAndUser: jest.fn(),
                        getAllMemosByVideo: jest.fn(),
                    },
                },
                {
                    provide: PlaylistService,
                    useValue: {
                        getPlaylist: jest.fn(),
                        createPlaylist: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<VemoService>(VemoService);
        memosService = module.get<MemosService>(MemosService);
        playlistService = module.get<PlaylistService>(PlaylistService);
    });

    describe('getCommunityMemos', () => {
        it('특정 사용자의 메모를 조회해야 한다', async () => {
            const videoId = 'test-video-id';
            const userId = 1;
            const mockMemosList = [mockMemos];

            jest.spyOn(memosService, 'getMemosByVideoAndUser').mockResolvedValue(mockMemosList);

            const result = await service.getCommunityMemos(videoId, 'mine', userId);

            expect(memosService.getMemosByVideoAndUser).toHaveBeenCalledWith(videoId, userId);
            expect(result.memos).toHaveLength(1);
            expect(result.memos[0]).toEqual({
                id: mockMemos.id,
                title: mockMemos.title,
                user: {
                    id: mockUser.id,
                    nickname: mockUser.nickname,
                },
                created_at: mockMemos.createdAt,
            });
        });

        it('모든 메모를 조회해야 한다', async () => {
            const videoId = 'test-video-id';
            const mockMemosList = [mockMemos];

            jest.spyOn(memosService, 'getAllMemosByVideo').mockResolvedValue(mockMemosList);

            const result = await service.getCommunityMemos(videoId, 'all');

            expect(memosService.getAllMemosByVideo).toHaveBeenCalledWith(videoId);
            expect(result.memos).toHaveLength(1);
            expect(result.memos[0]).toEqual({
                id: mockMemos.id,
                title: mockMemos.title,
                user: {
                    id: mockUser.id,
                    nickname: mockUser.nickname,
                },
                created_at: mockMemos.createdAt,
            });
        });
    });

    describe('getPlaylist', () => {
        it('재생목록을 조회해야 한다', async () => {
            const playlistId = 1;

            jest.spyOn(playlistService, 'getPlaylist').mockResolvedValue(mockPlaylistEntity);

            const result = await service.getPlaylist(playlistId);

            expect(playlistService.getPlaylist).toHaveBeenCalledWith(playlistId);
            expect(result).toEqual(mockPlaylistEntity);
        });
    });

    describe('createUserPlaylist', () => {
        it('재생목록을 생성해야 한다', async () => {
            const createPlaylistDto = {
                name: 'New Playlist',
                videoIds: ['video-1'],
            };
            const userId = 1;

            jest.spyOn(playlistService, 'createPlaylist').mockResolvedValue(mockPlaylistResponse);

            const result = await service.createUserPlaylist(createPlaylistDto, userId);

            expect(playlistService.createPlaylist).toHaveBeenCalledWith(createPlaylistDto, userId);
            expect(result).toEqual(mockPlaylistResponse);
        });
    });
});
