import { Test, TestingModule } from '@nestjs/testing';
import { MemoService } from './memo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memo } from './memo.entity';
import { CreateMemoData } from './interfaces/memo.interface';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { Memos } from '../memos/memos.entity';

describe('MemoService', () => {
    let service: MemoService;
    let repository: Repository<Memo>;

    const mockDate = new Date('2024-01-01T00:01:30.000Z'); // "00:01:30" 시간 데이터

    const mockCreateMemoData: CreateMemoData = {
        timestamp: mockDate,
        description: 'Test description',
        memosId: 1,
    };

    const mockMemos = {
        id: 1,
        title: 'Test Memos',
        createdAt: new Date(),
        user: null,
        video: null,
        memo: [],
        capture: [],
    } as Memos;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MemoService,
                {
                    provide: getRepositoryToken(Memo),
                    useValue: {
                        create: jest.fn(),
                        save: jest.fn(),
                        findOne: jest.fn(),
                        delete: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<MemoService>(MemoService);
        repository = module.get<Repository<Memo>>(getRepositoryToken(Memo));
    });

    describe('createMemo', () => {
        it('메모를 성공적으로 생성해야 한다', async () => {
            const createdMemo = {
                timestamp: mockCreateMemoData.timestamp,
                description: mockCreateMemoData.description,
                memos: { id: mockCreateMemoData.memosId },
            } as Memo;

            const savedMemo = {
                id: 1,
                timestamp: mockCreateMemoData.timestamp,
                description: mockCreateMemoData.description,
                memos: mockMemos,
            } as Memo;

            jest.spyOn(repository, 'create').mockReturnValue(createdMemo);
            jest.spyOn(repository, 'save').mockResolvedValue(savedMemo);

            const result = await service.createMemo(mockCreateMemoData);

            expect(repository.create).toHaveBeenCalledWith(mockCreateMemoData);
            expect(repository.save).toHaveBeenCalledWith(createdMemo);
            expect(result).toEqual(savedMemo);
        });

        it('저장 중 에러가 발생하면 에러를 전파해야 한다', async () => {
            jest.spyOn(repository, 'save').mockRejectedValue(new Error('DB Error'));

            await expect(service.createMemo(mockCreateMemoData)).rejects.toThrow('DB Error');
        });
    });

    describe('updateMemo', () => {
        it('메모를 성공적으로 수정해야 한다', async () => {
            const updateMemoDto: UpdateMemoDto = {
                id: 1,
                description: 'Updated description',
            };

            const existingMemo = {
                id: 1,
                timestamp: mockDate,
                description: 'Original description',
                memos: mockMemos,
            } as Memo;

            const updatedMemo = {
                ...existingMemo,
                description: 'Updated description',
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingMemo);
            jest.spyOn(repository, 'save').mockResolvedValue(updatedMemo);

            const result = await service.updateMemo(updateMemoDto);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: updateMemoDto.id } });
            expect(repository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    description: 'Updated description',
                    memos: mockMemos,
                }),
            );
            expect(result).toEqual(updatedMemo);
        });

        it('존재하지 않는 메모를 수정하려고 하면 에러를 던져야 한다', async () => {
            const updateMemoDto: UpdateMemoDto = {
                id: 999,
                description: 'Updated description',
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.updateMemo(updateMemoDto)).rejects.toThrow('Memo not found');
        });
    });

    describe('deleteMemo', () => {
        it('메모를 성공적으로 삭제해야 한다', async () => {
            const existingMemo = {
                id: 1,
                timestamp: mockDate,
                description: 'Test description',
                memos: mockMemos,
            } as Memo;

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingMemo);
            jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: [] });

            await service.deleteMemo(1);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
            expect(repository.delete).toHaveBeenCalledWith(1);
        });

        it('존재하지 않는 메모를 삭제하려고 하면 에러를 던져야 한다', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.deleteMemo(999)).rejects.toThrow('Memo not found');
        });

        it('삭제 중 에러가 발생하면 에러를 전파해야 한다', async () => {
            const existingMemo = {
                id: 1,
                timestamp: mockDate,
                description: 'Test description',
                memos: mockMemos,
            } as Memo;

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingMemo);
            jest.spyOn(repository, 'delete').mockRejectedValue(new Error('DB Error'));

            await expect(service.deleteMemo(1)).rejects.toThrow('DB Error');
        });
    });
});
