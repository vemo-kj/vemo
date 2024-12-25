import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Memo } from './entity/memo.entity';
import { Repository } from 'typeorm';
import { CreateMemoDto } from './dto/create-memo.dto';

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
}
