import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { MemosDto } from './memos.dto';

export class GetCommunityMemosResponseDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MemosDto)
    memos: MemosDto[];
}
