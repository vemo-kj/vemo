import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memo } from './entities/memo.entity';
import { CreateMemoDto } from './dto/create-memo.dto';

@Injectable()
export class MemoService {
    constructor(
        @InjectRepository(Memo)
        private memoRepository: Repository<Memo>,
    ) {}

    async create(createMemoDto: CreateMemoDto) {
        const memo = this.memoRepository.create(createMemoDto);
        return await this.memoRepository.save(memo);
    }

    async findAll() {
        return await this.memoRepository.find();
    }
}
