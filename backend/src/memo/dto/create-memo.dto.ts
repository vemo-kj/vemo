import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateMemoDto {
    @IsNotEmpty()
    timestamp: string;

    @IsOptional()
    @Length(0, 500)
    description?: string;

    @IsNotEmpty()
    memosId: number;
}
