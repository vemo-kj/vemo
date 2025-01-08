import { Module } from '@nestjs/common';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
import { Memo } from './memo.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemosService } from 'src/memos/memos.service';

@Module({
    imports: [TypeOrmModule.forFeature([Memo])],
    controllers: [MemoController],
    providers: [MemoService],
    exports: [MemosService],
})
export class MemoModule {}
