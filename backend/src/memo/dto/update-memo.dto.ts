import { IsNotEmpty, IsOptional, Length } from 'class-validator';

export class UpdateMemoDto {
    @IsNotEmpty()
    id: number;

    @IsOptional()
    @Length(0, 500)
    description?: string;
}
