import { IsString, IsUrl, Length } from 'class-validator';

export class ChannelResponseDto {
    @IsString()
    @Length(24, 24, { message: '채널 ID는 정확히 24자여야 한다..' })
    id: string;

    @IsUrl({}, { message: '채널 썸네일은 유효한 URL이어야 한다.' })
    thumbnails: string;

    @IsString()
    @Length(1, 100, { message: '채널 제목은 1자 이상 100자 이하여야 한다.' })
    title: string;
}
