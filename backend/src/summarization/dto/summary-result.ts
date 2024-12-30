import { IsNotEmpty } from 'class-validator';

export class SummaryResultDto {
    /*
    Open AI로 부터 받은 타임 스템프는 string 형태이므로 string만 검증
    이후 DB에 저장 할 때 Time 형태로 저장장
    */

    @IsNotEmpty()
    timestamp: string;

    @IsNotEmpty()
    summary: string;

    constructor(timestamp: string, summary: string) {
        this.timestamp = timestamp;
        this.summary = summary;
    }
}
