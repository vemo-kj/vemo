import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class ExtractTextDto {
    @IsString()
    @IsNotEmpty()
    @IsUrl()
    imageUrl: string;
}
