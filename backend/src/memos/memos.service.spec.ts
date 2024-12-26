import { Test, TestingModule } from '@nestjs/testing';
import { MemosService } from './memos.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Memos } from './memos.entity';
import { CreateMemosDto } from './dto/create-memos.dto';

describe('MemosService 테스트', () => {
    let service: MemosService;
    let mockRepository: Record<string, jest.Mock>;

    beforeEach(async () => {
        mockRepository = {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            delete: jest.fn(),
            find: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MemosService,
                {
                    provide: getRepositoryToken(Memos),
                    useValue: mockRepository, // Mock Repository 주입
                },
            ],
        }).compile();

        service = module.get<MemosService>(MemosService);
    });

    it('서비스가 정의되어야 한다.', () => {
        expect(service).toBeDefined();
    });

    describe('createMemo 메서드', () => {
        it('메모를 생성해야 한다.', async () => {
            const createMemoDto: CreateMemosDto = {
                title: '테스트 메모',
                description: '이것은 테스트 메모입니다.',
                userId: 1,
                videoId: 'video-id',
            };

            const createdMemo = {
                id: 1,
                ...createMemoDto,
                createdAt: new Date(),
                updatedAt: null,
            };

            mockRepository.create.mockReturnValue(createdMemo); // Mock create 메서드
            mockRepository.save.mockResolvedValue(createdMemo); // Mock save 메서드

            const result = await service.createMemo(createMemoDto);
            expect(result).toEqual(createdMemo); // 반환값 검증
            expect(mockRepository.create).toHaveBeenCalledWith(createMemoDto); // create 호출 검증
            expect(mockRepository.save).toHaveBeenCalledWith(createdMemo); // save 호출 검증
        });
    });

    describe('getMemoById 메서드', () => {
        it('ID로 메모를 조회해야 한다.', async () => {
            const memo = {
                id: 1,
                title: '테스트 메모',
                description: '이것은 테스트 메모입니다.',
                user: { id: 1 }, // Mock User
                video: { id: 'video-id' }, // Mock Video
                createdAt: new Date(),
                updatedAt: null,
            };

            mockRepository.findOne.mockResolvedValue(memo); // Mock findOne 메서드

            const result = await service.getMemoById(1);
            expect(result).toEqual(memo); // 반환값 검증
            expect(mockRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['user', 'video'],
            }); // findOne 호출 검증
        });

        it('메모가 존재하지 않을 경우 에러를 발생시켜야 한다.', async () => {
            mockRepository.findOne.mockResolvedValue(null);

            await expect(service.getMemoById(999)).rejects.toThrow('Memo with id 999 not found');
        });
    });

    describe('deleteMemo 메서드', () => {
        it('ID로 메모를 삭제해야 한다.', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 1 }); // Mock delete 성공

            await expect(service.deleteMemo(1)).resolves.not.toThrow();
            expect(mockRepository.delete).toHaveBeenCalledWith(1);
        });

        it('삭제할 메모가 없을 경우 에러를 발생시켜야 한다.', async () => {
            mockRepository.delete.mockResolvedValue({ affected: 0 }); // Mock delete 실패

            await expect(service.deleteMemo(999)).rejects.toThrow('Memo with id 999 not found');
        });
    });
});
