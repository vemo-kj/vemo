describe('MemoService', () => {
    let service: MemoService;
    let repository: Repository<Memo>;

    const mockMemo: Memo = {
        id: 1,
        timestamp: '03:40', // MM:SS 형식
        description: '테스트 메모입니다.',
        memos: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MemoService,
                {
                    provide: getRepositoryToken(Memo),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<MemoService>(MemoService);
        repository = module.get<Repository<Memo>>(getRepositoryToken(Memo));
    });

    describe('메모 생성', () => {
        it('유효한 타임스탬프로 메모를 생성해야 한다.', async () => {
            const createMemoDto: CreateMemoDto = {
                timestamp: '04:20', // 유튜브 타임스탬프
                description: '새로운 메모입니다.',
                memosId: 1,
            };

            jest.spyOn(repository, 'create').mockReturnValue(mockMemo);
            jest.spyOn(repository, 'save').mockResolvedValue(mockMemo);

            const result = await service.create(createMemoDto);
            expect(result).toEqual(mockMemo);
            expect(repository.create).toHaveBeenCalledWith(createMemoDto);
            expect(repository.save).toHaveBeenCalledWith(mockMemo);
        });

        it('잘못된 타임스탬프는 예외를 발생시켜야 한다.', async () => {
            const createMemoDto: CreateMemoDto = {
                timestamp: '123:45', // 잘못된 형식
                description: '잘못된 타임스탬프 메모입니다.',
                memosId: 1,
            };

            await expect(service.create(createMemoDto)).rejects.toThrow();
        });
    });

    describe('메모 수정', () => {
        it('기존 메모의 타임스탬프를 수정해야 한다.', async () => {
            const updateMemoDto: UpdateMemoDto = {
                id: 1,
                timestamp: '05:15', // 수정된 타임스탬프
                description: '수정된 메모입니다.',
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(mockMemo);
            jest.spyOn(repository, 'save').mockResolvedValue({
                ...mockMemo,
                ...updateMemoDto,
            });

            const result = await service.update(updateMemoDto);
            expect(result.timestamp).toBe('05:15');
            expect(result.description).toBe('수정된 메모입니다.');
        });
    });
});
