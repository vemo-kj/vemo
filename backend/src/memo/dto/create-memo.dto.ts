import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateMemoDto {
    @IsNotEmpty()
    timestamp: Date;

    @IsOptional()
    @Length(0, 500)
    description?: string;

    // memoseId 임시
    @IsNotEmpty()
    memosId: number;
}
