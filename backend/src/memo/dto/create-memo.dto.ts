import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMemoDto {
    @IsNotEmpty()
    timestamp: string;

    @IsOptional()
    description?: string;

    // memoseId 임시
    @IsOptional()
    memosId: string;
}
