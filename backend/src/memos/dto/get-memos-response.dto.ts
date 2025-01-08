// memos/dto/get-memos-response.dto.ts

import { Memo } from '../../memo/memo.entity';
import { Captures } from '../../captures/captures.entity';

export class GetMemosResponseDto {
    id: number;
    title: string;
    createdAt: Date;
    memo: Memo[];
    captures: Captures[];
}
