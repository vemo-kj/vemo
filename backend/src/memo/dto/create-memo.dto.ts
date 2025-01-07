import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateMemoDto {
    @IsNotEmpty()
    @IsString()
    timestamp: string;

    @IsOptional()
    @IsString()
    @Length(0, 500)
    description?: string;

    @IsNotEmpty()
    @IsNumber()
    memosId: number;
}
