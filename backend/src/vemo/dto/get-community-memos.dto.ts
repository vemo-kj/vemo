import { IsIn, IsNumber, IsOptional } from 'class-validator';

export class GetCommunityMemosDto {
    /**
     * 필터 옵션: 'all' 또는 'mine'
     */
    @IsOptional()
    @IsIn(['all', 'mine'])
    filter?: 'all' | 'mine';

    /**
     * 사용자 ID (필터가 mine일 때 필요)
     */
    @IsOptional()
    @IsNumber()
    userId?: number;
}
