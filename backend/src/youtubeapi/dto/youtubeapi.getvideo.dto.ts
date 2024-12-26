import { IsNotEmpty, IsString, Length } from 'class-validator';

export class getVideoDto {
    @IsString()
    @IsNotEmpty()
    @Length(11, 11)
    videoId: string;
}
