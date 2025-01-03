// import { Test, TestingModule } from '@nestjs/testing';
// import { MemoService } from './memo.service';
// import { Repository } from 'typeorm';
// import { Memo } from './memo.entity';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { CreateMemoDto } from './dto/create-memo.dto';
// import { UpdateMemoDto } from './dto/update-memo.dto';

// // MM:SS 형식 -> Date 변환 유틸리티 함수
// function convertToTimestamp(time: string): Date {
//     const [minutes, seconds] = time.split(':').map(Number);
//     if (minutes === undefined || seconds === undefined || isNaN(minutes) || isNaN(seconds)) {
//         throw new Error('Invalid timestamp format');
//     }
//     return new Date(1970, 0, 1, 0, minutes, seconds);
// }

// describe('MemoService', () => {
//     let service: MemoService;
//     let repository: Repository<Memo>;

//     const mockMemo: Memo = {
//         id: 1,
//         timestamp: convertToTimestamp('03:40'), // Date 객체로 변환
//         description: '테스트 메모입니다.',
//         memos: null,
//     };

//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             providers: [
//                 MemoService,
//                 {
//                     provide: getRepositoryToken(Memo),
//                     useClass: Repository,
//                 },
//             ],
//         }).compile();

//         service = module.get<MemoService>(MemoService);
//         repository = module.get<Repository<Memo>>(getRepositoryToken(Memo));
//     });

//     describe('메모 생성', () => {
//         it('유효한 타임스탬프로 메모를 생성해야 한다.', async () => {
//             const createMemoDto: CreateMemoDto = {
//                 timestamp: convertToTimestamp('04:20'), // Date로 변환
//                 description: '새로운 메모입니다.',
//                 memosId: 1,
//             };

//             jest.spyOn(repository, 'create').mockReturnValue(mockMemo);
//             jest.spyOn(repository, 'save').mockResolvedValue(mockMemo);

//             const result = await service.create(createMemoDto);
//             expect(result).toEqual(mockMemo);
//             expect(repository.create).toHaveBeenCalledWith(createMemoDto);
//             expect(repository.save).toHaveBeenCalledWith(mockMemo);
//         });
//     });

//     describe('메모 수정', () => {
//         it('기존 메모의 타임스탬프를 수정해야 한다.', async () => {
//             const updateMemoDto: UpdateMemoDto = {
//                 id: 1,
//                 timestamp: convertToTimestamp('05:15'), // 수정된 타임스탬프
//                 description: '수정된 메모입니다.',
//             };

//             jest.spyOn(repository, 'findOne').mockResolvedValue(mockMemo);
//             jest.spyOn(repository, 'save').mockResolvedValue({
//                 ...mockMemo,
//                 ...updateMemoDto,
//             });

//             const result = await service.update(updateMemoDto);
//             expect(result.timestamp).toEqual(updateMemoDto.timestamp);
//             expect(result.description).toBe('수정된 메모입니다.');
//         });
//     });

//     describe('메모 삭제', () => {
//         it('존재하는 메모를 삭제해야 한다.', async () => {
//             jest.spyOn(repository, 'findOne').mockResolvedValue(mockMemo);
//             jest.spyOn(repository, 'delete').mockResolvedValue({ affected: 1 } as any);

//             await expect(service.delete(1)).resolves.toBeUndefined();
//             expect(repository.delete).toHaveBeenCalledWith(1);
//         });

//         it('존재하지 않는 메모를 삭제하려고 하면 예외를 발생시켜야 한다.', async () => {
//             jest.spyOn(repository, 'findOne').mockResolvedValue(null);

//             await expect(service.delete(1)).rejects.toThrow('Memo not found');
//         });
//     });
// });
