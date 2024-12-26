import { IsNotEmpty, IsString, Length } from 'class-validator';

export class getChannelDto {
    @IsString()
    @IsNotEmpty()
    @Length(24, 24)
    channelId: string;
}
