import { IsNotEmpty } from 'class-validator';

export class CreateCapturesDto {
    @IsNotEmpty()
    timestamp: Date;

    @IsNotEmpty()
    image: string;

    @IsNotEmpty()
    memosId: number;
}
