import { Captures } from '../../captures/captures.entity';
import { Memo } from '../../memo/memo.entity';

export class CreateMemosResponseDto {
    id: number;
    title: string;
    createdAt: Date;
    memo: Memo[];
    captures: Captures[];
}
