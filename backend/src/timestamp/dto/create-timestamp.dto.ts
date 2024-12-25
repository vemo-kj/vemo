// 타임스탬프 생성 요청시 필요한 데이터 받는 역할
export class CreateTimestampDto {
    videoId: string;
    time: string;
    description: string;
}
