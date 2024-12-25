import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Memo } from './entity/memo.entity';
import { Repository } from 'typeorm';
import { CreateMemoDto } from './dto/create-memo.dto';
import { UpdateMemoDto } from './dto/update-memo.dto';
import { waitForDebugger } from 'inspector';

@Injectable()
export class MemoService {
    constructor(
        @InjectRepository(Memo)
        private memoRepository: Repository<Memo>,
    ) {}

    // Create Memo
    async create(createMemoDto: CreateMemoDto): Promise<Memo> {
        const memo = this.memoRepository.create(createMemoDto);
        return await this.memoRepository.save(memo);
    }

    // Find All Memo
    async findAll(): Promise<Memo[]> {
        return await this.memoRepository.find();
    }

    // Find Memo By memosId
    async findByMemosId(memosId: string): Promise<Memo[]> {
        return await this.memoRepository.find({
            where: { memosId },
        });
    }

    // Memo Update
    async update(dto: UpdateMemoDto): Promise<Memo> {
        const { id, timestamp, description } = dto;
        const memo = await this.memoRepository.findOne({ where: { id } });

        if (!memo) {
            throw new Error('Memo not found');
        }

        if (timestamp) {
            memo.timestamp = timestamp;
        }

        if (description) {
            memo.description = description;
        }

        return await this.memoRepository.save(memo);
    }

    async delete(id: number): Promise<void> {
        const result = await this.memoRepository.delete(id);

        if (result.affected === 0) {
            throw new Error('Memo not found');
        }
    }
}
