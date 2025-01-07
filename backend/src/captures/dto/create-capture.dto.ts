import { IsDate, IsString, IsObject } from 'class-validator';

export class CreateCapturesDto {
    @IsDate()
    timestamp: Date;

    @IsString()
    image: string;

    @IsObject()
    memos: { id: number };
}
