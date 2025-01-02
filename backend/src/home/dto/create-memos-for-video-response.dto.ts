import { IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ChannelDto {
    @IsString()
    id: string;

    @IsString()
    thumbnails: string;

    @IsString()
    title: string;
}

class MemosDto {
    id: number;
    title: string;
    description: string;
}

class VideoDto {
    @IsString()
    id: string;

    @IsString()
    title: string;

    @IsString()
    thumbnails: string;

    @ValidateNested()
    @Type(() => ChannelDto)
    channel: ChannelDto;

    @IsString()
    duration: string;

    @IsString()
    category: string;
}

export class CreateMemosForVideoResponseDto {
    @IsObject()
    @ValidateNested()
    @Type(() => VideoDto)
    video: VideoDto;
    memos: MemosDto;
}
