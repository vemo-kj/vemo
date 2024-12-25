import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateMemoDto {
    @IsNotEmpty()
    id: number; // 수정할 메모의 ID

    @IsOptional()
    timestamp?: string; // 수정할 타임스탬프 (선택)

    @IsOptional()
    description?: string; // 수정할 설명 (선택)
}
