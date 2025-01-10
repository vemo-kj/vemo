import { MemoResponseDto } from '../../memo/dto/memo-response.dto';
import { CapturesResponseDto } from '../../captures/dto/captures-response.dto';
import { Expose, Type } from 'class-transformer';

export class GetMemosResponseDto {
    @Expose()
    id: number;

    @Expose()
    title: string;

    @Expose()
    createdAt: Date;

    @Expose()
    @Type(() => MemoResponseDto)
    memo: MemoResponseDto[];

    @Expose()
    @Type(() => CapturesResponseDto)
    captures: CapturesResponseDto[];
}
