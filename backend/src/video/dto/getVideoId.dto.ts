import { IsNotEmpty, IsString } from 'class-validator';

export class getVideoIdDto {
    @IsString()
    @IsNotEmpty()
    videoId: string;
}
