import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class pdfMemoeDto {
    @IsNotEmpty()
    timestamp: string;

    @IsNotEmpty()
    @IsString()
    description: string;
}

export class pdfCaptureDto {
    @IsNotEmpty()
    timestamp: string;

    @IsString()
    @IsUrl()
    image: string;
}
