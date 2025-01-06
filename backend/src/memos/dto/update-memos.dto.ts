import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateMemosDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    title?: string;
}
