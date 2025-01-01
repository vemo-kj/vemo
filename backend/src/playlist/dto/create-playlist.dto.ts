import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlaylistDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    videoIds: string[];
}
