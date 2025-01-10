import { Expose, Transform } from 'class-transformer';
import { formatTimestamp } from '../../common/util/format-timestamp';

export class MemoResponseDto {
    @Expose()
    id: number;

    @Expose()
    @Transform(({ value }) => formatTimestamp(value))
    timestamp: string;

    @Expose()
    description: string;
}
