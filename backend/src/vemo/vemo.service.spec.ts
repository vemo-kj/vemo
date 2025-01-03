// import { Test, TestingModule } from '@nestjs/testing';
// import { VemoService } from './vemo.service';
// import { MemosService } from '../memos/memos.service';
// import { PlaylistService } from '../playlist/playlist.service';
// import { GetCommunityMemosDto } from './dto/get-community-memos.dto';
// import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
// import { PlaylistResponseDto } from '../playlist/dto/playlist-response.dto';
// import { CreatePlaylistDto } from '../playlist/dto/create-playlist.dto';

// describe('VemoService', () => {
//     let service: VemoService;
//     let memosService: MemosService;
//     let playlistService: PlaylistService;

beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
        providers: [
            VemoService,
            {
                provide: MemosService,
                useValue: {
                    getAllMemosByVideo: jest.fn(),
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

//         service = module.get<VemoService>(VemoService);
//         memosService = module.get<MemosService>(MemosService);
//         playlistService = module.get<PlaylistService>(PlaylistService);
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('커뮤니티 메모 조회', () => {
//         it('모든 메모를 성공적으로 조회해야 한다', async () => {
//             const videoId = 'video1';
//             const getCommunityMemosDto: GetCommunityMemosDto = {
//                 filter: 'all',
//                 userId: null, // 현재 로직에서는 무시됨
//             };

//             const mockMemos = [
//                 {
//                     id: 1,
//                     title: '메모 1',
//                     description: '설명 1',
//                     user: { id: 1, nickname: '유저1' },
//                     createdAt: new Date('2023-01-01T00:00:00Z'),
//                     updatedAt: null,
//                 },
//                 {
//                     id: 2,
//                     title: '메모 2',
//                     description: '설명 2',
//                     user: { id: 2, nickname: '유저2' },
//                     createdAt: new Date('2023-01-02T00:00:00Z'),
//                     updatedAt: new Date('2023-01-03T00:00:00Z'),
//                 },
//             ];

//             const expectedResponse: GetCommunityMemosResponseDto = {
//                 memos: mockMemos.map(memo => ({
//                     id: memo.id,
//                     title: memo.title,
//                     description: memo.description,
//                     user: {
//                         id: memo.user.id,
//                         nickname: memo.user.nickname,
//                     },
//                     created_at: memo.createdAt,
//                     updated_at: memo.updatedAt || memo.createdAt,
//                 })),
//             };

//             // memosService.getAllMemosByVideo 모킹
//             (memosService.getAllMemosByVideo as jest.Mock).mockResolvedValue(mockMemos);

//             // 서비스 메서드 호출
//             const result = await service.getCommunityMemos(videoId, getCommunityMemosDto);

//             // 검증
//             expect(memosService.getAllMemosByVideo).toHaveBeenCalledWith(videoId);
//             expect(result).toEqual(expectedResponse);
//         });
//     });

//     describe('사용자 재생목록 조회', () => {
//         it('사용자의 재생목록을 성공적으로 조회해야 한다', async () => {
//             const userId = 1;
//             const mockPlaylists: PlaylistResponseDto[] = [
//                 {
//                     id: 1,
//                     name: '재생목록 1',
//                     userId: userId,
//                     videos: [
//                         {
//                             id: 'video1',
//                             title: '비디오 1',
//                             thumbnails: 'http://example.com/video1.jpg',
//                             duration: '00:10:00',
//                             channel: {
//                                 title: '채널 1',
//                                 thumbnails: 'http://example.com/channel1.jpg',
//                             },
//                         },
//                         {
//                             id: 'video2',
//                             title: '비디오 2',
//                             thumbnails: 'http://example.com/video2.jpg',
//                             duration: '00:15:00',
//                             channel: {
//                                 title: '채널 2',
//                                 thumbnails: 'http://example.com/channel2.jpg',
//                             },
//                         },
//                     ],
//                 },
//                 {
//                     id: 2,
//                     name: '재생목록 2',
//                     userId: userId,
//                     videos: [],
//                 },
//             ];

//             // playlistService.getPlaylistsByUser 모킹
//             (playlistService.getPlaylistsByUser as jest.Mock).mockResolvedValue(mockPlaylists);

//             // 서비스 메서드 호출
//             const result = await service.getUserPlaylists(userId);

//             // 검증
//             expect(playlistService.getPlaylistsByUser).toHaveBeenCalledWith(userId);
//             expect(result).toEqual(mockPlaylists);
//         });
//     });

//     describe('사용자 재생목록 생성', () => {
//         it('사용자의 재생목록을 성공적으로 생성해야 한다', async () => {
//             const createPlaylistDto: CreatePlaylistDto = {
//                 name: '내 재생목록',
//                 videoIds: ['video1', 'video2'],
//                 userId: 1,
//             };

//             const mockPlaylistResponse: PlaylistResponseDto = {
//                 id: 1,
//                 name: createPlaylistDto.name,
//                 userId: createPlaylistDto.userId,
//                 videos: [
//                     {
//                         id: 'video1',
//                         title: '비디오 1',
//                         thumbnails: 'http://example.com/video1.jpg',
//                         duration: '00:10:00',
//                         channel: {
//                             title: '채널 1',
//                             thumbnails: 'http://example.com/channel1.jpg',
//                         },
//                     },
//                     {
//                         id: 'video2',
//                         title: '비디오 2',
//                         thumbnails: 'http://example.com/video2.jpg',
//                         duration: '00:15:00',
//                         channel: {
//                             title: '채널 2',
//                             thumbnails: 'http://example.com/channel2.jpg',
//                         },
//                     },
//                 ],
//             };

//             // playlistService.createPlaylist 모킹
//             (playlistService.createPlaylist as jest.Mock).mockResolvedValue(mockPlaylistResponse);

//             // 서비스 메서드 호출
//             const result = await service.createUserPlaylist(createPlaylistDto);

//             // 검증
//             expect(playlistService.createPlaylist).toHaveBeenCalledWith(createPlaylistDto);
//             expect(result).toEqual(mockPlaylistResponse);
//         });
//     });
// });
