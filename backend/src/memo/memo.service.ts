import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Memo } from './memo.entity';
import { Repository } from 'typeorm';
import { CreateMemoData } from './interfaces/memo.interface';
import { UpdateMemoDto } from './dto/update-memo.dto';

@Injectable()
export class MemoService {
    constructor(
        @InjectRepository(Memo)
        private memoRepository: Repository<Memo>,
    ) {}

    async createMemo(createMemoData: CreateMemoData): Promise<Memo> {
        const memo = this.memoRepository.create(createMemoData);
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
