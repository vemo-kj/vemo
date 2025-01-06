import { IsNotEmpty, IsString, IsUrl, isNotEmpty } from 'class-validator';

export class pdfMemoeDto {
    @IsNotEmpty()
    timestamp: string;

    @IsNotEmpty()
    @IsString()
    description: string;
}

export class pdfCaptureDto {
    @IsString()
    @IsNotEmpty()
    timestamp: string;

    @IsString()
    @IsUrl()
    image: string;
}
