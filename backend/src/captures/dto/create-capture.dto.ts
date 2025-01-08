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
}
