import { IsDate, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from './user.dto';

export class MemosDto {
    @IsNumber()
    id: number;

    @IsString()
    title: string;

    @IsString()
    description: string;

    @ValidateNested()
    @Type(() => UserDto)
    user: UserDto;

    @IsDate()
    created_at: Date;

    @IsDate()
    updated_at?: Date;
}
