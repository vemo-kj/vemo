import { IsNotEmpty, IsString } from 'class-validator';

export class SubtitleDto {
    @IsNotEmpty()
    startTime: string;

    @IsNotEmpty()
    endTime: string;

    @IsString()
    @IsNotEmpty({ message: 'Text must not be empty' })
    text: string;
}
