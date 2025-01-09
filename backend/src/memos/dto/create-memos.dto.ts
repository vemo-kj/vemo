import { IsNotEmpty, IsString, MaxLength, MinLength, IsNumber } from 'class-validator';

export class CreateMemosDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @IsString()
    videoId: string;

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
