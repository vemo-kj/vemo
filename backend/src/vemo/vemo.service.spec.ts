import { Test, TestingModule } from '@nestjs/testing';
import { VemoService } from './vemo.service';
import { MemosService } from '../memos/memos.service';
import { PlaylistService } from '../playlist/playlist.service';
import { NotFoundException } from '@nestjs/common';
import { Video } from '../video/video.entity';
import { Memos } from '../memos/memos.entity';
import { GetCommunityMemosDto } from './dto/get-community-memos.dto';
import { Playlist } from '../playlist/entities/playlist.entity';

describe('VemoService', () => {
    let service: VemoService;
    let memosService: MemosService;
    let playlistService: PlaylistService;

    // Mock 데이터 정의 (필요 시 공통 Mock 생성 함수 사용)
    const mockVideo: Video = {
        id: 'abcd1234efg',
        title: 'Sample Video',
        thumbnails: 'http://example.com/thumb.jpg',
        duration: '00:05:30',
        category: 'Education',
        channel: {
            id: 'channel1-id',
            thumbnails: 'http://example.com/channel1.jpg',
            title: 'Channel One',
            videos: [],
        },
        memos: [],
    } as Video;

    // Mock 서비스 정의
    const mockMemosService = {
        createMemos: jest.fn(),
        getAllMemosByVideo: jest.fn(),
    };

    const mockPlaylistService = {
        getPlaylistsByUser: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VemoService,
                {
                    provide: MemosService,
                    useValue: mockMemosService,
                },
                {
                    provide: PlaylistService,
                    useValue: mockPlaylistService,
                },
            ],
        }).compile();

        service = module.get<VemoService>(VemoService);
        memosService = module.get<MemosService>(MemosService);
        playlistService = module.get<PlaylistService>(PlaylistService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getCommunityMemos', () => {
        it('필터가 "all"일 때 모든 메모를 반환해야 한다', async () => {
            const videoId = 'abcd1234efg';
            const getCommunityMemosDto: GetCommunityMemosDto = { filter: 'all' };

            const memosList: Memos[] = [
                {
                    id: 1,
                    title: 'Memo 1',
                    description: 'Description 1',
                    createdAt: new Date(),
                    updatedAt: null,
                    user: { id: 1, name: 'User 1', memos: [] } as any,
                    video: mockVideo,
                    memo: [],
                },
                {
                    id: 2,
                    title: 'Memo 2',
                    description: 'Description 2',
                    createdAt: new Date(),
                    updatedAt: null,
                    user: { id: 2, name: 'User 2', memos: [] } as any,
                    video: mockVideo,
                    memo: [],
                },
            ];

            // Mock MemosService의 getAllMemosByVideo 설정
            mockMemosService.getAllMemosByVideo.mockResolvedValue(memosList);

            const result = await service.getCommunityMemos(videoId, getCommunityMemosDto);

            expect(memosService.getAllMemosByVideo).toHaveBeenCalledWith(videoId);
            expect(result).toEqual({ memos: memosList });
        });

        it('필터가 "mine"일 때 사용자별 메모를 반환해야 한다', async () => {
            const videoId = 'abcd1234efg';
            const getCommunityMemosDto: GetCommunityMemosDto = { filter: 'mine', userId: 1 };

            const memosList: Memos[] = [
                {
                    id: 1,
                    title: 'Memo 1',
                    description: 'Description 1',
                    createdAt: new Date(),
                    updatedAt: null,
                    user: { id: 1, name: 'User 1', memos: [] } as any,
                    video: mockVideo,
                    memo: [],
                },
                {
                    id: 2,
                    title: 'Memo 2',
                    description: 'Description 2',
                    createdAt: new Date(),
                    updatedAt: null,
                    user: { id: 2, name: 'User 2', memos: [] } as any,
                    video: mockVideo,
                    memo: [],
                },
            ];

            // Mock MemosService의 getAllMemosByVideo 설정
            mockMemosService.getAllMemosByVideo.mockResolvedValue(memosList);

            const expectedMemos = memosList.filter(
                memo => memo.user.id === getCommunityMemosDto.userId,
            );

            const result = await service.getCommunityMemos(videoId, getCommunityMemosDto);

            expect(memosService.getAllMemosByVideo).toHaveBeenCalledWith(videoId);
            expect(result).toEqual({ memos: expectedMemos });
        });

        it('필터가 "mine"이지만 userId가 제공되지 않을 경우 예외를 던져야 한다', async () => {
            const videoId = 'abcd1234efg';
            const getCommunityMemosDto: GetCommunityMemosDto = { filter: 'mine' };

            await expect(service.getCommunityMemos(videoId, getCommunityMemosDto)).rejects.toThrow(
                'User ID is required to filter my memos',
            );
            expect(memosService.getAllMemosByVideo).not.toHaveBeenCalled();
        });
    });

    describe('getUserPlaylists', () => {
        it('사용자의 모든 재생목록을 성공적으로 조회해야 한다', async () => {
            const userId = 1;
            const playlistsList: Playlist[] = [
                {
                    id: 1,
                    name: 'My Playlist 1',
                    user: { id: userId, name: 'User Name', playlists: [], memos: [] } as any,
                    videos: [mockVideo],
                },
                {
                    id: 2,
                    name: 'My Playlist 2',
                    user: { id: userId, name: 'User Name', playlists: [], memos: [] } as any,
                    videos: [mockVideo],
                },
            ];

            // Mock PlaylistService의 getPlaylistsByUser 설정
            mockPlaylistService.getPlaylistsByUser.mockResolvedValue(playlistsList);

            const result = await service.getUserPlaylists(userId);

            expect(playlistService.getPlaylistsByUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(playlistsList);
        });

        it('사용자가 재생목록을 가지고 있지 않을 경우 NotFoundException을 던져야 한다', async () => {
            const userId = 999;

            // Mock PlaylistService의 getPlaylistsByUser 설정
            mockPlaylistService.getPlaylistsByUser.mockRejectedValue(
                new NotFoundException(`User with ID ${userId} has no playlists`),
            );

            await expect(service.getUserPlaylists(userId)).rejects.toThrow(
                `User with ID ${userId} has no playlists`,
            );
            expect(playlistService.getPlaylistsByUser).toHaveBeenCalledWith(userId);
        });
    });
});
