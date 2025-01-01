import { ArrayNotEmpty, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreatePlaylistWithMemosDto {
    @IsNotEmpty({ message: '재생목록 이름은 필수입니다.' })
    @IsString({ message: '재생목록 이름은 문자열이어야 합니다.' })
    name: string;

    @IsArray({ message: '영상 ID는 배열이어야 합니다.' })
    @ArrayNotEmpty({ message: '영상 ID 배열은 비어 있을 수 없습니다.' })
    @IsString({ each: true, message: '각 영상 ID는 문자열이어야 합니다.' })
    videoIds: string[];
}
