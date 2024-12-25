import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTimestampDto {
    @IsNotEmpty()
    videoId: string;

    @IsNotEmpty()
    timestamp: string;

    @IsOptional()
    description?: string;
}
