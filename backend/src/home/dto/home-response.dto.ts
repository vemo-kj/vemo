import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { VideoResponseDto } from '../../video/dto/video-response.dto';

export class HomeResponseDto {
    @IsArray({ message: 'videos는 배열이어야 한다.' })
    @ValidateNested({ each: true, message: 'videos 배열의 각 요소는 유효해야 한다.' })
    @Type(() => VideoResponseDto)
    videos: VideoResponseDto[];
}
