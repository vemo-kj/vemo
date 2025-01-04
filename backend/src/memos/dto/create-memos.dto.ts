import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateMemosDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    title: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    description: string;
    
    
    @IsNotEmpty()
    @IsString()
    videoId: string;

    @IsNotEmpty()
    // @IsNumber() // 실제로 숫자로 받을 경우
    userId: number;

}
