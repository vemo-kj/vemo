import { IsUrl, IsNotEmpty } from 'class-validator';

export class VideoUrlDto {
    @IsUrl()
    @IsNotEmpty()
    url: string;
}
