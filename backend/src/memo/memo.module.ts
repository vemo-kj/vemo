import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoController } from './memo.controller';
import { Memo } from './memo.entity';
import { MemoService } from './memo.service';

@Module({
    imports: [TypeOrmModule.forFeature([Memo])],
    controllers: [MemoController],
    providers: [MemoService],
    exports: [MemoService],
})
export class MemoModule {}
