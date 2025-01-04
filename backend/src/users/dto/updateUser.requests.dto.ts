import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    birth?: Date;

    @IsString()
    @IsOptional()
    gender?: string;

    @IsString()
    @IsOptional()
    nickname?: string;

    @IsString()
    @IsOptional()
    introduction?: string;
}
