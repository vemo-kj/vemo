import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateCapturesDto {
    @IsNotEmpty()
    id: number;

    @IsOptional()
    image?: string;
}
