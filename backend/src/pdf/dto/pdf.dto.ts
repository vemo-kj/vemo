import { IsNotEmpty, IsString, IsUrl, isNotEmpty } from 'class-validator';

export class pdfMemoeDto {
    @IsNotEmpty()
    timestamp: Date;

    @IsNotEmpty()
    @IsString()
    description: string;
}

export class pdfCaptureDto {
    @IsNotEmpty()
    timestamp: Date;

    @IsString()
    @IsUrl()
    image: string;
}
