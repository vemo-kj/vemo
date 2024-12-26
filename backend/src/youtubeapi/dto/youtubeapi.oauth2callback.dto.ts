import { IsNotEmpty, IsString } from 'class-validator';

export class oauth2CallbackDto {
    @IsString()
    @IsNotEmpty()
    code: string;
}
