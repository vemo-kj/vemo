import { Test, TestingModule } from '@nestjs/testing';
import { MemosService } from './memos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Memos } from './memos.entity';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('MemosService', () => {
    let service: MemosService;
    let memosRepository: Repository<Memos>;
    let cacheManager: Cache;

    const mockMemos = {
        id: 1,
        title: 'Test Memo',
        video: { id: 'video-id', channel: {} },
        user: { id: 1 },
        memo: [],
        capture: [],
        createdAt: new Date(),
    };

    const mockMemosRepository = {
        find: jest.fn(),
        findOne: jest.fn(),
        save: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
    };

    const mockCacheManager = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MemosService,
                {
                    provide: getRepositoryToken(Memos),
                    useValue: mockMemosRepository,
                },
                {
                    provide: CACHE_MANAGER,
                    useValue: mockCacheManager,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        service = module.get<MemosService>(MemosService);
        memosRepository = module.get<Repository<Memos>>(getRepositoryToken(Memos));
        cacheManager = module.get(CACHE_MANAGER);
    });

    describe('createMemos', () => {
        it('메모를 성공적으로 생성해야 한다', async () => {
            const title = 'Test Memo';
            const videoId = 'test-video-id';
            const userId = 1;

            mockMemosRepository.save.mockResolvedValue({ id: 1 });
            mockMemosRepository.findOne.mockResolvedValue(mockMemos);

            const result = await service.createMemos(title, videoId, userId);

            expect(mockMemosRepository.save).toHaveBeenCalledWith({
                title,
                video: { id: videoId },
                user: { id: userId },
            });
            expect(result).toEqual(mockMemos);
        });

        it('메모 생성 실패 시 InternalServerErrorException을 던져야 한다', async () => {
            mockMemosRepository.save.mockRejectedValue(new Error('DB Error'));

            await expect(service.createMemos('title', 'videoId', 1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('getVemoCountByVideo', () => {
        it('캐시된 메모 수가 있으면 캐시에서 반환해야 한다', async () => {
            const videoId = 'test-video-id';
            const cachedCount = 5;

            mockCacheManager.get.mockResolvedValue(cachedCount);

            const result = await service.getVemoCountByVideo(videoId);

            expect(mockCacheManager.get).toHaveBeenCalledWith(`vemo:count:${videoId}`);
            expect(memosRepository.count).not.toHaveBeenCalled();
            expect(result).toBe(cachedCount);
        });

        it('캐시 미스 시 DB에서 조회하고 캐시에 저장해야 한다', async () => {
            const videoId = 'test-video-id';
            const dbCount = 5;

            mockCacheManager.get.mockResolvedValue(undefined);
            mockMemosRepository.count.mockResolvedValue(dbCount);

            const result = await service.getVemoCountByVideo(videoId);

            expect(memosRepository.count).toHaveBeenCalledWith({
                where: { video: { id: videoId } },
            });
            expect(mockCacheManager.set).toHaveBeenCalledWith(
                `vemo:count:${videoId}`,
                dbCount,
                3600,
            );
            expect(result).toBe(dbCount);
        });
    });

    describe('getMemosByVideoAndUser', () => {
        it('특정 비디오와 사용자의 메모를 조회해야 한다', async () => {
            const videoId = 'test-video-id';
            const userId = 1;
            const mockMemosList = [mockMemos];

            mockMemosRepository.find.mockResolvedValue(mockMemosList);

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
            mockMemosRepository.find.mockRejectedValue(new Error('DB Error'));

            await expect(service.getMemosByVideoAndUser('videoId', 1)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('deleteMemos', () => {
        it('메모를 삭제해야 한다', async () => {
            const memosId = 1;
            mockMemosRepository.findOne.mockResolvedValue(mockMemos);
            mockMemosRepository.delete.mockResolvedValue({ affected: 1 });

            await service.deleteMemos(memosId);

            expect(memosRepository.delete).toHaveBeenCalledWith(memosId);
            expect(mockCacheManager.del).toHaveBeenCalledWith(`vemo:count:${mockMemos.video.id}`);
        });

        it('존재하지 않는 메모를 삭제하려고 하면 NotFoundException을 던져야 한다', async () => {
            const memosId = 999;
            mockMemosRepository.findOne.mockResolvedValue(null);

            await expect(service.deleteMemos(memosId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('getMemosById', () => {
        it('ID로 메모를 조회해야 한다', async () => {
            mockMemosRepository.findOne.mockResolvedValue(mockMemos);

            const result = await service.getMemosById(1);

            expect(memosRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'video', 'memo', 'capture', 'video.channel'],
            });
            expect(result).toEqual(mockMemos);
        });

        it('존재하지 않는 메모를 조회하면 NotFoundException을 던져야 한다', async () => {
            mockMemosRepository.findOne.mockResolvedValue(null);

            await expect(service.getMemosById(999)).rejects.toThrow(NotFoundException);
        });
    });
});
