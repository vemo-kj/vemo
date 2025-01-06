// import { Test, TestingModule } from '@nestjs/testing';
// import { MemosService } from './memos.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Memos } from './memos.entity';
// import { Repository } from 'typeorm';
// import { CreateMemosDto } from './dto/create-memos.dto';
// import { UpdateMemosDto } from './dto/update-memos.dto';
// import { Users } from '../users/users.entity';
// import { Video } from '../video/video.entity';

// type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// const createMockRepository = <T = any>(): MockRepository<T> => ({
//     find: jest.fn(),
//     findOne: jest.fn(),
//     create: jest.fn(),
//     save: jest.fn(),
//     delete: jest.fn(),
// });

// describe('MemosService', () => {
//     let service: MemosService;
//     let memosRepository: MockRepository<Memos>;
//     let userRepository: MockRepository<Users>;
//     let videoRepository: MockRepository<Video>;

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 MemosService,
//                 {
//                     provide: getRepositoryToken(Memos),
//                     useValue: createMockRepository(),
//                 },
//                 {
//                     provide: getRepositoryToken(Users),
//                     useValue: createMockRepository(),
//                 },
//                 {
//                     provide: getRepositoryToken(Video),
//                     useValue: createMockRepository(),
//                 },
//             ],
//         }).compile();

//         service = module.get<MemosService>(MemosService);
//         memosRepository = module.get<MockRepository<Memos>>(getRepositoryToken(Memos));
//         userRepository = module.get<MockRepository<Users>>(getRepositoryToken(Users));
//         videoRepository = module.get<MockRepository<Video>>(getRepositoryToken(Video));
//     });

//     describe('메모 생성', () => {
//         it('새로운 메모를 성공적으로 생성해야 한다', async () => {
//             const createMemosDto: CreateMemosDto = {
//                 title: '테스트 메모',
//                 description: '메모 설명',
//                 userId: 1,
//             };

//             const videoId = 'video_id'; // 별도로 전달할 videoId

//             const user: Users = { id: 1 } as Users;
//             const video: Video = { id: videoId } as Video;

//             const createdMemos: Memos = {
//                 id: 1,
//                 title: createMemosDto.title,
//                 description: createMemosDto.description,
//                 createdAt: new Date(),
//                 updatedAt: null,
//                 user: user,
//                 video: video,
//                 memo: [],
//             };

//             // 모킹된 리포지토리의 메서드 동작 정의
//             userRepository.findOne.mockResolvedValue(user);
//             videoRepository.findOne.mockResolvedValue(video);
//             memosRepository.create.mockReturnValue(createdMemos);
//             memosRepository.save.mockResolvedValue(createdMemos);

//             // 서비스 메서드 호출 시, CreateMemosDto와 videoId를 함께 전달
//             const result = await service.createMemos({ ...createMemosDto, videoId });

//             // 호출된 메서드 검증
//             expect(userRepository.findOne).toHaveBeenCalledWith({
//                 where: { id: createMemosDto.userId },
//             });
//             expect(videoRepository.findOne).toHaveBeenCalledWith({
//                 where: { id: videoId },
//             });
//             expect(memosRepository.create).toHaveBeenCalledWith({
//                 title: createMemosDto.title,
//                 description: createMemosDto.description,
//                 user: user,
//                 video: video,
//             });
//             expect(memosRepository.save).toHaveBeenCalledWith(createdMemos);

//             // 결과 검증
//             expect(result).toEqual(createdMemos);
//         });

//         it('존재하지 않는 사용자 ID로 메모를 생성하려 할 때 예외를 던져야 한다', async () => {
//             const createMemosDto: CreateMemosDto = {
//                 title: '테스트 메모',
//                 description: '메모 설명',
//                 userId: 999,
//             };

//             const videoId = 'video_id';

//             userRepository.findOne.mockResolvedValue(undefined);

//             await expect(service.createMemos({ ...createMemosDto, videoId })).rejects.toThrow(
//                 `User with ID ${createMemosDto.userId} not found`,
//             );
//             expect(userRepository.findOne).toHaveBeenCalledWith({
//                 where: { id: createMemosDto.userId },
//             });
//         });

//         it('존재하지 않는 비디오 ID로 메모를 생성하려 할 때 예외를 던져야 한다', async () => {
//             const createMemosDto: CreateMemosDto = {
//                 title: '테스트 메모',
//                 description: '메모 설명',
//                 userId: 1,
//             };

//             const videoId = 'non-existent-video-id';

//             const user: Users = { id: 1 } as Users;
//             userRepository.findOne.mockResolvedValue(user);
//             videoRepository.findOne.mockResolvedValue(undefined);

//             await expect(service.createMemos({ ...createMemosDto, videoId })).rejects.toThrow(
//                 `Video with ID ${videoId} not found`,
//             );
//             expect(userRepository.findOne).toHaveBeenCalledWith({
//                 where: { id: createMemosDto.userId },
//             });
//             expect(videoRepository.findOne).toHaveBeenCalledWith({
//                 where: { id: videoId },
//             });
//         });
//     });

//     describe('사용자별 메모 조회', () => {
//         it('특정 사용자의 모든 메모를 성공적으로 조회해야 한다', async () => {
//             const userId = 1;
//             const memosList: Memos[] = [
//                 {
//                     id: 1,
//                     title: '메모1',
//                     description: '설명1',
//                     createdAt: new Date(),
//                     updatedAt: null,
//                     user: { id: userId } as Users,
//                     video: { id: 'video-1' } as Video,
//                     memo: [],
//                 },
//                 {
//                     id: 2,
//                     title: '메모2',
//                     description: '설명2',
//                     createdAt: new Date(),
//                     updatedAt: null,
//                     user: { id: userId } as Users,
//                     video: { id: 'video-2' } as Video,
//                     memo: [],
//                 },
//             ];

//             memosRepository.find.mockResolvedValue(memosList);

//             const result = await service.getAllMemosByUser(userId);
//             expect(memosRepository.find).toHaveBeenCalledWith({
//                 where: { user: { id: userId } },
//                 relations: ['video', 'memos'],
//             });
//             expect(result).toEqual(memosList);
//         });
//     });

//     describe('비디오별 메모 조회', () => {
//         it('특정 비디오의 모든 메모를 성공적으로 조회해야 한다', async () => {
//             const videoId = 'video-uuid';
//             const memosList: Memos[] = [
//                 {
//                     id: 1,
//                     title: '메모1',
//                     description: '설명1',
//                     createdAt: new Date(),
//                     updatedAt: null,
//                     user: { id: 1 } as Users,
//                     video: { id: videoId } as Video,
//                     memo: [],
//                 },
//             ];

//             memosRepository.find.mockResolvedValue(memosList);

//             const result = await service.getAllMemosByVideo(videoId);
//             expect(memosRepository.find).toHaveBeenCalledWith({
//                 where: { video: { id: videoId } },
//                 relations: ['user', 'video', 'memos'],
//             });
//             expect(result).toEqual(memosList);
//         });
//     });

//     describe('메모 ID로 조회', () => {
//         it('존재하는 메모 ID로 메모를 성공적으로 조회해야 한다', async () => {
//             const memosId = 1;
//             const memos: Memos = {
//                 id: memosId,
//                 title: '메모1',
//                 description: '설명1',
//                 createdAt: new Date(),
//                 updatedAt: null,
//                 user: { id: 1 } as Users,
//                 video: { id: 'video-uuid' } as Video,
//                 memo: [],
//             };

//             memosRepository.findOne.mockResolvedValue(memos);

//             const result = await service.getMemosById(memosId);
//             expect(memosRepository.findOne).toHaveBeenCalledWith({
//                 where: { id: memosId },
//                 relations: ['user', 'video', 'memos'],
//             });
//             expect(result).toEqual(memos);
//         });

//         it('존재하지 않는 메모 ID로 조회 시 예외를 던져야 한다', async () => {
//             const memosId = 999;
//             memosRepository.findOne.mockResolvedValue(undefined);

//             await expect(service.getMemosById(memosId)).rejects.toThrow(
//                 `Memos with ID ${memosId} not found`,
//             );
//             expect(memosRepository.findOne).toHaveBeenCalledWith({
//                 where: { id: memosId },
//                 relations: ['user', 'video', 'memos'],
//             });
//         });
//     });

//     describe('메모 업데이트', () => {
//         it('존재하는 메모를 성공적으로 업데이트해야 한다', async () => {
//             const memosId = 1;
//             const updateMemosDto: UpdateMemosDto = {
//                 title: '업데이트된 제목',
//                 description: '업데이트된 설명',
//             };

//             const existingMemos: Memos = {
//                 id: memosId,
//                 title: '기존 제목',
//                 description: '기존 설명',
//                 createdAt: new Date(),
//                 updatedAt: null,
//                 user: { id: 1 } as Users,
//                 video: { id: 'video-uuid' } as Video,
//                 memo: [],
//             };

//             const updatedMemos: Memos = {
//                 ...existingMemos,
//                 ...updateMemosDto,
//                 updatedAt: new Date(),
//             };

//             memosRepository.findOne.mockResolvedValue(existingMemos);
//             memosRepository.save.mockResolvedValue(updatedMemos);

//             const result = await service.updateMemos(memosId, updateMemosDto);
//             expect(memosRepository.findOne).toHaveBeenCalledWith({ where: { id: memosId } });
//             expect(Object.assign(existingMemos, updateMemosDto)).toEqual({
//                 ...existingMemos,
//                 ...updateMemosDto,
//             });
//             expect(memosRepository.save).toHaveBeenCalledWith(existingMemos);
//             expect(result).toEqual(updatedMemos);
//         });

//         it('존재하지 않는 메모를 업데이트하려 할 때 예외를 던져야 한다', async () => {
//             const memosId = 999;
//             const updateMemosDto: UpdateMemosDto = {
//                 title: '업데이트된 제목',
//                 description: '업데이트된 설명',
//             };

//             memosRepository.findOne.mockResolvedValue(undefined);

//             await expect(service.updateMemos(memosId, updateMemosDto)).rejects.toThrow(
//                 `Memos with ID ${memosId} not found`,
//             );
//             expect(memosRepository.findOne).toHaveBeenCalledWith({ where: { id: memosId } });
//         });
//     });

//     describe('메모 삭제', () => {
//         it('존재하는 메모를 성공적으로 삭제해야 한다', async () => {
//             const memosId = 1;
//             memosRepository.delete.mockResolvedValue({ affected: 1 });

//             await service.deleteMemos(memosId);
//             expect(memosRepository.delete).toHaveBeenCalledWith(memosId);
//         });

//         it('존재하지 않는 메모를 삭제하려 할 때 예외를 던져야 한다', async () => {
//             const memosId = 999;
//             memosRepository.delete.mockResolvedValue({ affected: 0 });

//             await expect(service.deleteMemos(memosId)).rejects.toThrow(
//                 `Memos with ID ${memosId} not found`,
//             );
//             expect(memosRepository.delete).toHaveBeenCalledWith(memosId);
//         });
//     });
// });
