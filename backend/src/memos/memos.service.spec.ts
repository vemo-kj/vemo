import { Test, TestingModule } from '@nestjs/testing';
import { MemosService } from './memos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memos } from './memos.entity';
import { Users } from '../users/users.entity';
import { Video } from '../video/video.entity';
import { Memo } from '../memo/memo.entity';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { UpdateMemosDto } from './dto/update-memos.dto';

describe('MemosService', () => {
    let service: MemosService;
    let memosRepository: Repository<Memos>;
    let userRepository: Repository<Users>;
    let videoRepository: Repository<Video>;

    const mockUser = {
        id: 1,
        nickname: 'testUser',
    } as Users;

    const mockVideo = {
        id: 'test-video-id',
        title: 'Test Video',
        channel: {
            id: 'channel-1',
            title: 'Test Channel',
        },
    } as Video;

    const mockMemo = {
        id: 1,
        timestamp: new Date(),
        description: 'Test Memo Description',
        memos: null,
    } as Memo;

    const mockMemos = {
        id: 1,
        title: 'Test Memos',
        createdAt: new Date(),
        user: mockUser,
        video: mockVideo,
        memo: [mockMemo],
        capture: [],
    } as Memos;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MemosService,
                {
                    provide: getRepositoryToken(Memos),
                    useValue: {
                        find: jest.fn(),
                        findOne: jest.fn(),
                        save: jest.fn(),
                        delete: jest.fn(),
                        create: jest.fn(),
                        count: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Users),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: getRepositoryToken(Video),
                    useValue: {
                        findOne: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MemosService>(MemosService);
        memosRepository = module.get<Repository<Memos>>(getRepositoryToken(Memos));
        userRepository = module.get<Repository<Users>>(getRepositoryToken(Users));
        videoRepository = module.get<Repository<Video>>(getRepositoryToken(Video));
    });

    describe('createMemos', () => {
        it('메모를 생성해야 한다', async () => {
            const memosTitle = 'New Memos';
            const videoId = 'test-video-id';
            const userId = 1;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(videoRepository, 'findOne').mockResolvedValue(mockVideo);
            jest.spyOn(memosRepository, 'create').mockReturnValue(mockMemos);
            jest.spyOn(memosRepository, 'save').mockResolvedValue(mockMemos);

            const result = await service.createMemos(memosTitle, videoId, userId);

            expect(userRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
            expect(videoRepository.findOne).toHaveBeenCalledWith({
                where: { id: videoId },
                relations: ['channel'],
            });
            expect(memosRepository.create).toHaveBeenCalledWith({
                title: memosTitle,
                user: mockUser,
                video: mockVideo,
            });
            expect(result).toEqual(mockMemos);
        });

        it('존재하지 않는 사용자로 메모를 생성하려고 하면 NotFoundException을 던져야 한다', async () => {
            const memosTitle = 'New Memos';
            const videoId = 'test-video-id';
            const userId = 999;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

            await expect(service.createMemos(memosTitle, videoId, userId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('존재하지 않는 비디오로 메모를 생성하려고 하면 NotFoundException을 던져야 한다', async () => {
            const memosTitle = 'New Memos';
            const videoId = 'non-existent-video';
            const userId = 1;

            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(videoRepository, 'findOne').mockResolvedValue(null);

            await expect(service.createMemos(memosTitle, videoId, userId)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('getVemoCountByVideo', () => {
        it('비디오의 메모 개수를 반환해야 한다', async () => {
            const videoId = 'test-video-id';
            const count = 5;

            jest.spyOn(memosRepository, 'count').mockResolvedValue(count);

            const result = await service.getVemoCountByVideo(videoId);

            expect(memosRepository.count).toHaveBeenCalledWith({
                where: { video: { id: videoId } },
            });
            expect(result).toBe(count);
        });
    });

    describe('getAllMemosByUser', () => {
        it('사용자의 모든 메모를 조회해야 한다', async () => {
            const userId = 1;
            const mockMemosList = [mockMemos];

            jest.spyOn(memosRepository, 'find').mockResolvedValue(mockMemosList);

            const result = await service.getAllMemosByUser(userId);

            expect(memosRepository.find).toHaveBeenCalledWith({
                where: { user: { id: userId } },
                relations: ['video', 'memos'],
            });
            expect(result).toEqual(mockMemosList);
        });
    });

    describe('getAllMemosByVideo', () => {
        it('비디오의 모든 메모를 조회해야 한다', async () => {
            const videoId = 'test-video-id';
            const mockMemosList = [mockMemos];

            jest.spyOn(memosRepository, 'find').mockResolvedValue(mockMemosList);

            const result = await service.getAllMemosByVideo(videoId);

            expect(memosRepository.find).toHaveBeenCalledWith({
                where: { video: { id: videoId } },
                relations: ['user', 'video', 'video.channel', 'memo', 'capture'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(mockMemosList);
        });

        it('조회 중 에러가 발생하면 InternalServerErrorException을 던져야 한다', async () => {
            const videoId = 'test-video-id';

            jest.spyOn(memosRepository, 'find').mockRejectedValue(new Error('DB Error'));

            await expect(service.getAllMemosByVideo(videoId)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('getMemosById', () => {
        it('ID로 메모를 조회해야 한다', async () => {
            const memosId = 1;

            jest.spyOn(memosRepository, 'findOne').mockResolvedValue(mockMemos);

            const result = await service.getMemosById(memosId);

            expect(memosRepository.findOne).toHaveBeenCalledWith({
                where: { id: memosId },
                relations: ['user', 'video', 'memo', 'capture', 'video.channel'],
            });
            expect(result).toEqual(mockMemos);
        });

        it('존재하지 않는 메모를 조회하면 NotFoundException을 던져야 한다', async () => {
            const memosId = 999;

            jest.spyOn(memosRepository, 'findOne').mockResolvedValue(null);

            await expect(service.getMemosById(memosId)).rejects.toThrow(NotFoundException);
        });

        it('조회 중 에러가 발생하면 InternalServerErrorException을 던져야 한다', async () => {
            const memosId = 1;

            jest.spyOn(memosRepository, 'findOne').mockRejectedValue(new Error('DB Error'));

            await expect(service.getMemosById(memosId)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('updateMemos', () => {
        it('메모를 수정해야 한다', async () => {
            const memosId = 1;
            const updateMemosDto: UpdateMemosDto = {
                title: 'Updated Title',
            };

            const updatedMemos = {
                ...mockMemos,
                title: updateMemosDto.title,
            };

            jest.spyOn(memosRepository, 'findOne').mockResolvedValue(mockMemos);
            jest.spyOn(memosRepository, 'save').mockResolvedValue(updatedMemos);

            const result = await service.updateMemos(memosId, updateMemosDto);

            expect(memosRepository.findOne).toHaveBeenCalledWith({ where: { id: memosId } });
            expect(memosRepository.save).toHaveBeenCalledWith({
                ...mockMemos,
                ...updateMemosDto,
            });
            expect(result).toEqual(updatedMemos);
        });

        it('존재하지 않는 메모를 수정하려고 하면 NotFoundException을 던져야 한다', async () => {
            const memosId = 999;
            const updateMemosDto: UpdateMemosDto = {
                title: 'Updated Title',
            };

            jest.spyOn(memosRepository, 'findOne').mockResolvedValue(null);

            await expect(service.updateMemos(memosId, updateMemosDto)).rejects.toThrow(
                NotFoundException,
            );
        });
    });

    describe('deleteMemos', () => {
        it('메모를 삭제해야 한다', async () => {
            const memosId = 1;

            jest.spyOn(memosRepository, 'delete').mockResolvedValue({ affected: 1, raw: [] });

            await service.deleteMemos(memosId);

            expect(memosRepository.delete).toHaveBeenCalledWith(memosId);
        });

        it('존재하지 않는 메모를 삭제하려고 하면 NotFoundException을 던져야 한다', async () => {
            const memosId = 999;

            jest.spyOn(memosRepository, 'delete').mockResolvedValue({ affected: 0, raw: [] });

            await expect(service.deleteMemos(memosId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getMemosByVideoAndUser', () => {
        it('특정 비디오와 사용자의 메모를 조회해야 한다', async () => {
            const videoId = 'test-video-id';
            const userId = 1;
            const mockMemosList = [mockMemos];

            jest.spyOn(memosRepository, 'find').mockResolvedValue(mockMemosList);

            const result = await service.getMemosByVideoAndUser(videoId, userId);

            expect(memosRepository.find).toHaveBeenCalledWith({
                where: {
                    video: { id: videoId },
                    user: { id: userId },
                },
                relations: ['user', 'video', 'video.channel', 'memo', 'capture'],
                order: { createdAt: 'DESC' },
            });
            expect(result).toEqual(mockMemosList);
        });

        it('조회 중 에러가 발생하면 InternalServerErrorException을 던져야 한다', async () => {
            const videoId = 'test-video-id';
            const userId = 1;

            jest.spyOn(memosRepository, 'find').mockRejectedValue(new Error('DB Error'));

            await expect(service.getMemosByVideoAndUser(videoId, userId)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });
});
