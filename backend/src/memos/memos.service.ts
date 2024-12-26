import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memos } from './memos.entity';
import { CreateMemosDto } from './dto/create-memos.dto';
import { UpdateMemosDto } from './dto/update-memos.dto';

@Injectable()
export class MemosService {
    constructor(@InjectRepository(Memos) private readonly memoRepository: Repository<Memos>) {}

    async createMemo(createMemoDto: CreateMemosDto): Promise<Memos> {
        const memo = this.memoRepository.create(createMemoDto);
        return await this.memoRepository.save(memo);
    }

    async getAllMemosByVideo(): Promise<Memos[]> {
        return await this.memoRepository.find({ relations: ['user', 'video'] });
    }

    async getMemoById(id: number): Promise<Memos> {
        const memo = await this.memoRepository.findOne({
            where: { id },
            relations: ['user', 'video'],
        });
        if (!memo) throw new Error(`Memo with id ${id} not found`);
        return memo;
    }

    async updateMemo(id: number, updateMemoDto: UpdateMemosDto): Promise<Memos> {
        const memo = await this.memoRepository.findOne({
            where: { id },
        });
        if (!memo) throw new Error(`Memo with id ${id} not found`);
        Object.assign(memo, updateMemoDto);
        return await this.memoRepository.save(memo);
    }

    async deleteMemo(id: number): Promise<void> {
        const result = await this.memoRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Memo with id ${id} not found`);
        }
    }
}
