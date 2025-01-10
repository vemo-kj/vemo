import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoController } from './memo.controller';
import { Memo } from './memo.entity';
import { MemoService } from './memo.service';
import { Memos } from 'src/memos/memos.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Memo, Memos])],
    controllers: [MemoController],
    providers: [MemoService],
    exports: [MemoService],
})
export class MemoModule {}
