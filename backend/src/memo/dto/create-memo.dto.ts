import { IsNotEmpty, IsOptional, Length, IsString } from 'class-validator';

export class CreateMemoDto {
    @IsNotEmpty()
    @IsString()
    timestamp: string;

    @IsOptional()
    @Length(0, 500)
    description?: string;

    @IsNotEmpty()
    memosId: number;
}
