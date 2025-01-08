<<<<<<< HEAD
import { IsDate, IsString, IsObject } from 'class-validator';

export class CreateCapturesDto {
    @IsDate()
    timestamp: Date;

    @IsString()
    image: string;

    @IsObject()
    memos: { id: number };
=======
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateCapturesDto {
    @IsNotEmpty()
    @IsString()
    timestamp: string;

    @IsNotEmpty()
    @IsString()
    image: string;

    @IsNotEmpty()
    @IsNumber()
    memosId: number;
>>>>>>> 0219246c9f9663094ece87dbb6ecc496f0ea54f3
}
