import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCapturesDto {
    @IsNotEmpty({ message: '타임스탬프는 필수입니다.' })
    @IsString({ message: '타임스탬프는 문자열이어야 합니다.' })
    timestamp: string;

    @IsNotEmpty({ message: '이미지는 필수입니다.' })
    @IsString({ message: '이미지는 문자열이어야 합니다.' })
    image: string;

    @IsNotEmpty({ message: '메모 ID는 필수입니다.' })
    memosId: number;
}