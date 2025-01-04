import { Test, TestingModule } from '@nestjs/testing';
import { VemoService } from './vemo.service';
import { MemosService } from '../memos/memos.service';
import { PlaylistService } from '../playlist/playlist.service';
import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';
import { CreatePlaylistWithMemosDto } from '../home/dto/create-playlist-with-memos.dto';

describe('VemoService', () => {
    let service: VemoService;
    let memosService: MemosService;
    let playlistService: PlaylistService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                VemoService,
                {
                    provide: MemosService,
                    useValue: {
                        getAllMemosByVideo: jest.fn(),
                        getMemosByVideoAndUser: jest.fn(),
                    },
                },
                {
                    provide: PlaylistService,
                    useValue: {
                        getPlaylistsByUser: jest.fn(),
                        createPlaylist: jest.fn(),
                    },
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
        const mockMemos = [
            {
                id: 1,
                title: '메모 1',
                description: '설명 1',
                user: { id: 1, nickname: '유저1' },
                createdAt: new Date('2023-01-01T00:00:00Z'),
                updatedAt: null,
                video: {
                    id: 'video123',
                    title: '비디오 1',
                    thumbnails: 'thumbnail1.jpg',
                    duration: '10:00:00',
                    category: 'ENTERTAINMENT',
                    channel: {
                        id: 'channel123',
                        thumbnails: 'channel-thumb1.jpg',
                        title: '채널 1',
                    },
                },
            },
            {
                id: 2,
                title: '메모 2',
                description: '설명 2',
                user: { id: 2, nickname: '유저2' },
                createdAt: new Date('2023-01-02T00:00:00Z'),
                updatedAt: new Date('2023-01-03T00:00:00Z'),
                video: {
                    id: 'video456',
                    title: '비디오 2',
                    thumbnails: 'thumbnail2.jpg',
                    duration: '05:30:00',
                    category: 'MUSIC',
                    channel: {
                        id: 'channel456',
                        thumbnails: 'channel-thumb2.jpg',
                        title: '채널 2',
                    },
                },
            },
        ];

        const expectedResponse = {
            memos: mockMemos.map(memo => ({
                id: memo.id,
                title: memo.title,
                description: memo.description,
                user: {
                    id: memo.user.id,
                    nickname: memo.user.nickname,
                },
                created_at: memo.createdAt,
                updated_at: memo.updatedAt || memo.createdAt,
            })),
        };

        it('모든 메모를 조회해야 한다 (filter: all)', async () => {
            const videoId = 'video123';
            (memosService.getAllMemosByVideo as jest.Mock).mockResolvedValue(mockMemos);

            const result = await service.getCommunityMemos(videoId, 'all');

            expect(memosService.getAllMemosByVideo).toHaveBeenCalledWith(videoId);
            expect(result).toEqual(expectedResponse);
        });

        it('특정 사용자의 메모만 조회해야 한다 (filter: mine)', async () => {
            const videoId = 'video123';
            const userId = 1;
            (memosService.getMemosByVideoAndUser as jest.Mock).mockResolvedValue([mockMemos[0]]);

            const result = await service.getCommunityMemos(videoId, 'mine', userId);

            expect(memosService.getMemosByVideoAndUser).toHaveBeenCalledWith(videoId, userId);
            expect(result).toEqual({
                memos: [expectedResponse.memos[0]],
            });
        });
    });

    describe('getUserPlaylists', () => {
        it('사용자의 재생목록을 조회해야 한다', async () => {
            const userId = 1;
            const mockPlaylists: PlaylistResponseDto[] = [
                {
                    id: 1,
                    name: '재생목록 1',
                    userId: userId,
                    videos: [
                        {
                            id: 'video123',
                            title: '비디오 1',
                            thumbnails: 'thumbnail1.jpg',
                            duration: '10:00:00',
                            channel: {
                                id: 'channel123',
                                title: '채널 1',
                                thumbnails: 'channel-thumb1.jpg',
                            },
                            category: 'ENTERTAINMENT',
                        },
                    ],
                },
            ];

            (playlistService.getPlaylistsByUser as jest.Mock).mockResolvedValue(mockPlaylists);

            const result = await service.getPlaylist(userId);

            expect(playlistService.getPlaylistsByUser).toHaveBeenCalledWith(userId);
            expect(result).toEqual(mockPlaylists);
        });
    });

    describe('createUserPlaylist', () => {
        it('새로운 재생목록을 생성해야 한다', async () => {
            const userId = 1;
            const createPlaylistDto: CreatePlaylistWithMemosDto = {
                name: '새 재생목록',
                videoIds: ['video123', 'video456'],
            };

            const mockPlaylistResponse: PlaylistResponseDto = {
                id: 1,
                name: createPlaylistDto.name,
                userId: userId,
                videos: [
                    {
                        id: 'video123',
                        title: '비디오 1',
                        thumbnails: 'thumbnail1.jpg',
                        duration: '10:00:00',
                        channel: {
                            id: 'channel123',
                            title: '채널 1',
                            thumbnails: 'channel-thumb1.jpg',
                        },
                        category: 'ENTERTAINMENT',
                    },
                ],
            };

            (playlistService.createPlaylist as jest.Mock).mockResolvedValue(mockPlaylistResponse);

            const result = await service.createUserPlaylist(createPlaylistDto, userId);

            expect(playlistService.createPlaylist).toHaveBeenCalledWith(createPlaylistDto, userId);
            expect(result).toEqual(mockPlaylistResponse);
        });
    });
});
