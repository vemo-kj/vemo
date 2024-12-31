import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePlaylistDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    videoIds: string[];

    @IsNotEmpty()
    @IsNumber()
    userId: number;
}
