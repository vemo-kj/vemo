// import { Test, TestingModule } from '@nestjs/testing';
// import { Channel } from '../channel/channel.entity';
// import { CreateMemosDto } from '../memos/dto/create-memos.dto';
// import { Memos } from '../memos/memos.entity';
// import { MemosService } from '../memos/memos.service';
// import { Users } from '../users/users.entity';
// import { Video } from '../video/video.entity';
// import { VideoService } from '../video/video.service';
// import { CreateMemosForVideoResponseDto } from './dto/create-memos-for-video-response.dto';
// import { HomeResponseDto } from './dto/home-response.dto';
// import { HomeService } from './home.service';

// // 공통 Mock 데이터 생성 함수
// const createMockUser = (overrides?: Partial<Users>): Users => ({
//     id: 1,
//     name: 'User Name',
//     email: 'user@example.com',
//     password: 'hashedpassword',
//     birth: new Date('1990-01-01'),
//     gender: 'Male',
//     nickname: 'Nickname', // 필수 속성 추가
//     profileImage: 'http://example.com/profile.jpg', // 필수 속성 추가
//     introduction: 'This is a user introduction.', // 필수 속성 추가
//     memos: [],
//     playlists: [],
//     ...overrides,
// });

// const createMockChannel = (overrides?: Partial<Channel>): Channel => ({
//     id: 'channel1-id',
//     thumbnails: 'http://example.com/channel1.jpg',
//     title: 'Channel One',
//     videos: [],
//     ...overrides,
// });

// const createMockVideo = (overrides?: Partial<Video>): Video => ({
//     id: 'abcd1234efg',
//     title: 'Sample Video',
//     thumbnails: 'http://example.com/thumb.jpg',
//     duration: '00:05:30',
//     category: 'Education',
//     channel: createMockChannel(),
//     memos: [],
//     ...overrides,
// });

// const createMockMemos = (overrides?: Partial<Memos>): Memos => ({
//     id: 1,
//     title: 'Sample Memo',
//     description: 'This is a sample memo.',
//     createdAt: new Date(),
//     updatedAt: null,
//     user: createMockUser(),
//     video: createMockVideo(),
//     memo: [],
//     ...overrides,
// });

// describe('HomeService', () => {
//     let service: HomeService;
//     let memosService: MemosService;
//     let videoService: VideoService;

//     // Mock 데이터 정의
//     const mockVideo: Video = createMockVideo();

//     const mockCreateMemoForVideoResponseDto: CreateMemosForVideoResponseDto = {
//         video: {
//             id: mockVideo.id,
//             title: mockVideo.title,
//             thumbnails: mockVideo.thumbnails,
//             channel: {
//                 id: mockVideo.channel.id, // string 타입
//                 thumbnails: mockVideo.channel.thumbnails,
//                 title: mockVideo.channel.title,
//             },
//             duration: mockVideo.duration,
//             category: mockVideo.category,
//         },
//         vemoCount: 5,
//     };

//     // Mock 서비스 정의
//     const mockMemosService = {
//         createMemos: jest.fn(),
//         getVemoCountByVideo: jest.fn(),
//     };

//     const mockVideoService = {
//         getVideoById: jest.fn(),
//         getAllVideos: jest.fn(),
//     };

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 HomeService,
//                 {
//                     provide: MemosService,
//                     useValue: mockMemosService,
//                 },
//                 {
//                     provide: VideoService,
//                     useValue: mockVideoService,
//                 },
//             ],
//         }).compile();

//         service = module.get<HomeService>(HomeService);
//         memosService = module.get<MemosService>(MemosService);
//         videoService = module.get<VideoService>(VideoService);
//     });

//     afterEach(() => {
//         jest.clearAllMocks();
//     });

//     describe('createMemosForVideo', () => {
//         it('비디오가 존재하고, 메모가 성공적으로 생성되어야 한다', async () => {
//             const videoId = 'abcd1234efg';
//             const createMemosDto: CreateMemosDto = {
//                 title: 'New Memo',
//                 description: 'This is a new memo.',
//                 userId: 1,
//                 videoId: videoId, // string 타입
//             };

//             // Mock VideoService의 getVideoById 설정
//             mockVideoService.getVideoById.mockResolvedValue(mockVideo);

//             // Mock MemosService의 createMemos 설정
//             const createdMemo: Memos = createMockMemos({
//                 id: 1,
//                 title: createMemosDto.title,
//                 description: createMemosDto.description,
//                 user: createMockUser({
//                     id: createMemosDto.userId,
//                     name: 'User Name',
//                     email: 'user@example.com',
//                     password: 'hashedpassword',
//                     birth: new Date('1990-01-01'),
//                     gender: 'Male',
//                     nickname: 'Nickname',
//                     profileImage: 'http://example.com/profile.jpg',
//                     introduction: 'This is a user introduction.',
//                 }),
//                 video: mockVideo,
//             });

//             mockMemosService.createMemos.mockResolvedValue(createdMemo);

//             // Mock MemosService의 getVemoCountByVideo 설정
//             mockMemosService.getVemoCountByVideo.mockResolvedValue(5);

//             const result = await service.createMemosForVideo(videoId, createMemosDto);

//             expect(videoService.getVideoById).toHaveBeenCalledWith(videoId);
//             expect(memosService.createMemos).toHaveBeenCalledWith(createMemosDto, videoId);
//             expect(memosService.getVemoCountByVideo).toHaveBeenCalledWith(videoId);
//             expect(result).toEqual(mockCreateMemoForVideoResponseDto);
//         });

//         it('비디오가 존재하지 않을 경우 NotFoundException을 던져야 한다', async () => {
//             const videoId = 'nonexistent-video-id';
//             const createMemosDto: CreateMemosDto = {
//                 title: 'New Memo',
//                 description: 'This is a new memo.',
//                 userId: 1,
//                 videoId: videoId, // string 타입
//             };

//             // Mock VideoService의 getVideoById 설정
//             mockVideoService.getVideoById.mockResolvedValue(null);

//             await expect(service.createMemosForVideo(videoId, createMemosDto)).rejects.toThrow(
//                 `Video with ID ${videoId} not found`,
//             );

//             expect(videoService.getVideoById).toHaveBeenCalledWith(videoId);
//             expect(memosService.createMemos).not.toHaveBeenCalled();
//             expect(memosService.getVemoCountByVideo).not.toHaveBeenCalled();
//         });
//     });

//     describe('getAllVideos', () => {
//         it('비디오가 존재하고, 메모 수와 함께 비디오 리스트를 반환해야 한다', async () => {
//             const page = 1;
//             const limit = 10;
//             const videos: Video[] = [
//                 createMockVideo({
//                     id: 'video1',
//                     title: 'Video 1',
//                     thumbnails: 'http://example.com/video1.jpg',
//                     duration: '00:10:00',
//                     category: 'Education',
//                     channel: createMockChannel({
//                         id: 'channel1-id',
//                         thumbnails: 'http://example.com/channel1.jpg',
//                         title: 'Channel One',
//                     }),
//                 }),
//                 createMockVideo({
//                     id: 'video2',
//                     title: 'Video 2',
//                     thumbnails: 'http://example.com/video2.jpg',
//                     duration: '00:15:00',
//                     category: 'Entertainment',
//                     channel: createMockChannel({
//                         id: 'channel2-id',
//                         thumbnails: 'http://example.com/channel2.jpg',
//                         title: 'Channel Two',
//                     }),
//                 }),
//             ];

//             // Mock VideoService의 getAllVideos 설정
//             mockVideoService.getAllVideos.mockResolvedValue(videos);

//             // Mock MemosService의 getVemoCountByVideo 설정
//             mockMemosService.getVemoCountByVideo.mockResolvedValueOnce(3).mockResolvedValueOnce(5);

//             const expectedResponse: HomeResponseDto = {
//                 videos: [
//                     {
//                         id: 'video1',
//                         title: 'Video 1',
//                         thumbnails: 'http://example.com/video1.jpg',
//                         duration: '00:10:00',
//                         category: 'Education',
//                         channel: {
//                             id: 'channel1-id',
//                             thumbnails: 'http://example.com/channel1.jpg',
//                             title: 'Channel One',
//                         },
//                         vemoCount: 3,
//                     },
//                     {
//                         id: 'video2',
//                         title: 'Video 2',
//                         thumbnails: 'http://example.com/video2.jpg',
//                         duration: '00:15:00',
//                         category: 'Entertainment',
//                         channel: {
//                             id: 'channel2-id',
//                             thumbnails: 'http://example.com/channel2.jpg',
//                             title: 'Channel Two',
//                         },
//                         vemoCount: 5,
//                     },
//                 ],
//             };

//             const result = await service.getAllVideos(page, limit);

//             expect(videoService.getAllVideos).toHaveBeenCalledWith(page, limit);
//             expect(memosService.getVemoCountByVideo).toHaveBeenCalledTimes(videos.length);
//             expect(memosService.getVemoCountByVideo).toHaveBeenNthCalledWith(1, 'video1');
//             expect(memosService.getVemoCountByVideo).toHaveBeenNthCalledWith(2, 'video2');
//             expect(result).toEqual(expectedResponse);
//         });

//         it('비디오가 존재하지 않을 경우 NotFoundException을 던져야 한다', async () => {
//             const page = 1;
//             const limit = 10;

//             // Mock VideoService의 getAllVideos 설정
//             mockVideoService.getAllVideos.mockResolvedValue([]);

//             await expect(service.getAllVideos(page, limit)).rejects.toThrow(
//                 '비디오가 존재하지 않습니다.',
//             );

//             expect(videoService.getAllVideos).toHaveBeenCalledWith(page, limit);
//             expect(memosService.getVemoCountByVideo).not.toHaveBeenCalled();
//         });
//     });
// });
