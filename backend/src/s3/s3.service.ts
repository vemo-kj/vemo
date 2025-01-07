import { Injectable } from '@nestjs/common';
import { S3 } from 'aws-sdk';

@Injectable()
export class S3Service {
    private s3 = new S3();

    // S3에 파일 업로드
    async uploadFile(bucket: string, key: string, body: any): Promise<string> {
        const params = {
            Bucket: bucket,
            Key: key,
            Body: body,
        };
        await this.s3.upload(params).promise();
        return `https://${bucket}.s3.amazonaws.com/${key}`; // 업로드된 파일의 URL 반환
    }
} 