import { IsNotEmpty, IsString } from 'class-validator';

export class ExtractTextDto {
    @IsNotEmpty()
    @IsString()
    imageBase64: string;
}
