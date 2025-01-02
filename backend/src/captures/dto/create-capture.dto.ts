import { IsNotEmpty } from 'class-validator';

export class CreateCapturesDto {
    @IsNotEmpty()
    timestamp: Date;

    @IsNotEmpty()
    memosId: number;

    @IsNotEmpty()
    image: string;
}
