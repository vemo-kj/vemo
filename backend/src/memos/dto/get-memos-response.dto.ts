// memos/dto/get-memos-response.dto.ts

import { Captures } from '../../captures/captures.entity';
import { Memo } from '../../memo/memo.entity';

export class GetMemosResponseDto {
    id: number;
    title: string;
    createdAt: Date;
    memo: Memo[];
    captures: Captures[];
}
