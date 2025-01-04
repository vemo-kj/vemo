import { Test, TestingModule } from '@nestjs/testing';
import { MemoService } from './memo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Memo } from './memo.entity';
import { Repository } from 'typeorm';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { Memos } from '../memos/memos.entity';

// describe('MemoService', () => {
//     let service: MemoService;
//     let repository: Repository<Memo>;

const mockMemos: Memos = {
    id: 1,
    title: '테스트 메모스',
    description: '테스트 메모스 설명',
    createdAt: new Date(),
    updatedAt: new Date(),
    user: null,
    video: null,
    memo: [],
    capture: [],
};

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

    //         service = module.get<MemoService>(MemoService);
    //         repository = module.get<Repository<Memo>>(getRepositoryToken(Memo));
    //     });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createMemo', () => {
        it('메모를 성공적으로 생성해야 한다', async () => {
            const createMemoDto: CreateMemoDto = {
                description: '테스트 메모',
                timestamp: new Date(),
                memosId: 1,
            };

            const mockMemo: Memo = {
                id: 1,
                description: createMemoDto.description,
                timestamp: createMemoDto.timestamp,
                memos: mockMemos,
            };

            //             jest.spyOn(repository, 'create').mockReturnValue(mockMemo);
            //             jest.spyOn(repository, 'save').mockResolvedValue(mockMemo);

            const result = await service.createMemo(createMemoDto);

            expect(repository.create).toHaveBeenCalledWith(createMemoDto);
            expect(repository.save).toHaveBeenCalledWith(mockMemo);
            expect(result).toEqual(mockMemo);
        });
    });

    describe('updateMemo', () => {
        it('메모를 성공적으로 수정해야 한다', async () => {
            const updateMemoDto: UpdateMemoDto = {
                id: 1,
                description: '수정된 메모',
            };

            const existingMemo: Memo = {
                id: 1,
                description: '원래 메모',
                timestamp: new Date(),
                memos: mockMemos,
            };

            const updatedMemo: Memo = {
                ...existingMemo,
                description: updateMemoDto.description,
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingMemo);
            jest.spyOn(repository, 'save').mockResolvedValue(updatedMemo);

            const result = await service.updateMemo(updateMemoDto);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: updateMemoDto.id } });
            expect(repository.save).toHaveBeenCalledWith(updatedMemo);
            expect(result).toEqual(updatedMemo);
        });

        it('존재하지 않는 메모를 수정하려 할 때 에러를 발생시켜야 한다', async () => {
            const updateMemoDto: UpdateMemoDto = {
                id: 999,
                description: '수정된 메모',
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.updateMemo(updateMemoDto)).rejects.toThrow('Memo not found');
        });
    });

    describe('deleteMemo', () => {
        it('메모를 성공적으로 삭제해야 한다', async () => {
            const memoId = 1;
            const existingMemo: Memo = {
                id: memoId,
                description: '삭제할 메모',
                timestamp: new Date(),
                memos: mockMemos,
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingMemo);
            jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1, raw: [] });

            await service.deleteMemo(memoId);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: memoId } });
            expect(repository.delete).toHaveBeenCalledWith(memoId);
        });

        it('존재하지 않는 메모를 삭제하려 할 때 에러를 발생시켜야 한다', async () => {
            const memoId = 999;

            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            await expect(service.deleteMemo(memoId)).rejects.toThrow('Memo not found');
        });
    });
});
