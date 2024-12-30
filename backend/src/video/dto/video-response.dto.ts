import { IsInt, IsString, IsUrl, Length, Matches, Min } from 'class-validator';
import { ChannelResponseDto } from '../../channel/dto/channel-response.dto';

export class VideoResponseDto {
    @IsString()
    @Length(11, 11, { message: '비디오 ID는 정확히 11자여야 한다.' })
    id: string;

    @IsString()
    @Length(1, 100, { message: '비디오 제목은 1자 이상 100자 이하여야 한다.' })
    title: string;

    @IsUrl({}, { message: '비디오 썸네일은 유효한 URL이어야 한다.' })
    thumbnails: string;

    @IsString()
    @Matches(/^([0-1]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: '비디오 길이는 HH:MM:SS 형식이어야 한다.',
    })
    duration: string;

    @IsString()
    @Length(1, 50, { message: '비디오 카테고리는 1자 이상 50자 이하여야 한다.' })
    category: string;

    channel: ChannelResponseDto;

    @IsInt({ message: 'vemoCount는 정수여야 한다.' })
    @Min(0, { message: 'vemoCount는 0 이상이어야 한다.' })
    vemoCount: number;
}
