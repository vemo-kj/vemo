import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class SignupRequestsDto {
    @IsString()
    @Length(1, 100)
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @Length(8, 60)
    @IsNotEmpty()
    password: string;

    @IsDate()
    @IsNotEmpty()
    @Type(() => Date)
    birth: Date;

    @IsEnum(['Male', 'Female', 'Other'])
    @IsNotEmpty()
    gender: string;

    @IsString()
    @Length(1, 30)
    @IsNotEmpty()
    nickname: string;

    @IsOptional()
    @IsString()
    profileImage?: string;

    @IsOptional()
    @IsString()
    @Length(0, 255)
    introduction?: string;
}
