import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Memo } from './memo.entity';
import { Memos } from 'src/memos/memos.entity';
import { Repository } from 'typeorm';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Injectable()
export class MemoService {
    constructor(
        @InjectRepository(Memos) private readonly memosRepository: Repository<Memos>,
        @InjectRepository(Memo) private readonly memoRepository: Repository<Memo>,
    ) {}

    async createMemo(createMemoDto: CreateMemoDto): Promise<Memo> {
        const { memosId, ...rest } = createMemoDto;
        const memos = await this.memosRepository.findOne({
            where: { id: memosId },
        });

        const memo = this.memoRepository.create({
            ...rest,
            memos,
        });

        return await this.memoRepository.save(memo);
    }

    async updateMemo(dto: UpdateMemoDto): Promise<Memo> {
        const { id, description } = dto;
        const memo = await this.memoRepository.findOne({ where: { id } });

        if (!memo) {
            throw new Error('Memo not found');
        }

        memo.description = description;

        return await this.memoRepository.save(memo);
    }

    async deleteMemo(id: number): Promise<void> {
        const memo = await this.memoRepository.findOne({ where: { id } });

        if (!memo) {
            throw new Error('Memo not found');
        }

        await this.memoRepository.delete(id);
    }
}
