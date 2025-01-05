import { Test, TestingModule } from '@nestjs/testing';
import { CapturesService } from './captures.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Captures } from './captures.entity';
import { Repository } from 'typeorm';
import { CreateCapturesDto } from './dto/create-capture.dto';
import { UpdateCapturesDto } from './dto/update-capture.dto';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Memos } from '../memos/memos.entity';
import { Users } from '../users/users.entity';
import { Video } from '../video/video.entity';

describe('CapturesService', () => {
    let service: CapturesService;
    let repository: Repository<Captures>;

    const mockUser = {
        id: 1,
        email: 'test@example.com',
    } as Users;

    const mockVideo = {
        id: 'test-video-id',
        title: 'Test Video',
    } as Video;

    const mockMemos = {
        id: 1,
        title: 'Test Memos',
        createdAt: new Date(),
        user: mockUser,
        video: mockVideo,
        memo: [],
        capture: [],
    } as Memos;

    const mockCapture = {
        id: 1,
        timestamp: new Date(),
        image: 'test-image.jpg',
        memos: mockMemos,
    } as Captures;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CapturesService,
                {
                    provide: getRepositoryToken(Captures),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        find: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CapturesService>(CapturesService);
        repository = module.get<Repository<Captures>>(getRepositoryToken(Captures));
    });

    describe('createCapture', () => {
        it('캡처를 성공적으로 생성해야 한다', async () => {
            const createCaptureDto: CreateCapturesDto = {
                timestamp: new Date(),
                image: 'test-image.jpg',
                memosId: 1,
            };

            jest.spyOn(repository, 'create').mockReturnValue(mockCapture);
            jest.spyOn(repository, 'save').mockResolvedValue(mockCapture);

            const result = await service.createCapture(createCaptureDto);

            expect(repository.create).toHaveBeenCalledWith(createCaptureDto);
            expect(repository.save).toHaveBeenCalledWith(mockCapture);
            expect(result).toEqual(mockCapture);
        });

        it('저장 중 에러가 발생하면 InternalServerErrorException을 던져야 한다', async () => {
            const createCaptureDto: CreateCapturesDto = {
                timestamp: new Date(),
                image: 'test-image.jpg',
                memosId: 1,
            };

            jest.spyOn(repository, 'save').mockRejectedValue(new Error('DB Error'));

            await expect(service.createCapture(createCaptureDto)).rejects.toThrow(
                InternalServerErrorException,
            );
        });
    });

    describe('getCaptures', () => {
        it('모든 캡처를 성공적으로 조회해야 한다', async () => {
            const mockCaptures = [mockCapture];
            jest.spyOn(repository, 'find').mockResolvedValue(mockCaptures);

            const result = await service.getCaptures();

            expect(repository.find).toHaveBeenCalledWith({
                relations: ['memos'],
                order: { timestamp: 'ASC' },
            });
            expect(result).toEqual(mockCaptures);
        });

        it('조회 중 에러가 발생하면 InternalServerErrorException을 던져야 한다', async () => {
            jest.spyOn(repository, 'find').mockRejectedValue(new Error('DB Error'));

            await expect(service.getCaptures()).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getCaptureById', () => {
        it('특정 캡처를 성공적으로 조회해야 한다', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockCapture);

            const result = await service.getCaptureById(1);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['memos'],
            });
            expect(result).toEqual(mockCapture);
        });

        it('존재하지 않는 캡처를 조회하면 NotFoundException을 던져야 한다', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.getCaptureById(999)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateCapture', () => {
        it('캡처를 성공적으로 수정해야 한다', async () => {
            const updateCaptureDto: UpdateCapturesDto = {
                id: 1,
                image: 'updated-image.jpg',
            };

            const updatedCapture = { ...mockCapture, image: 'updated-image.jpg' } as Captures;
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockCapture);
            jest.spyOn(repository, 'save').mockResolvedValue(updatedCapture);

            const result = await service.updateCapture(1, updateCaptureDto);

            expect(repository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['memos'],
            });
            expect(repository.save).toHaveBeenCalled();
            expect(result).toEqual(updatedCapture);
        });

        it('존재하지 않는 캡처를 수정하려고 하면 NotFoundException을 던져야 한다', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(
                service.updateCapture(999, { id: 999, image: 'test.jpg' }),
            ).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteCapture', () => {
        it('캡처를 성공적으로 삭제해야 한다', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(mockCapture);
            jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: [] });

            await service.deleteCapture(1);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(repository.delete).toHaveBeenCalledWith(1);
        });

        it('존재하지 않는 캡처를 삭제하려고 하면 NotFoundException을 던져야 한다', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.deleteCapture(999)).rejects.toThrow(NotFoundException);
        });
    });
});
