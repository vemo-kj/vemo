import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private readonly logger = new Logger(S3Service.name);

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    this.logger.log('S3 클라이언트 초기화 완료');
  }

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    this.logger.log(`S3 업로드 시작 - key: ${key}, size: ${file.size}`);
    
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    try {
      await this.s3Client.send(command);
      const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      this.logger.log(`S3 업로드 성공 - url: ${url}`);
      return url;
    } catch (error) {
      this.logger.error('S3 업로드 실패:', error);
      throw new Error(`파일 업로드 실패: ${error.message}`);
    }
  }

  async getFile(key: string) {
    this.logger.log(`S3 파일 조회 시작 - key: ${key}`);
    
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    try {
      const response = await this.s3Client.send(command);
      this.logger.log('S3 파일 조회 성공');
      return response.Body;
    } catch (error) {
      this.logger.error('S3 파일 조회 실패:', error);
      throw new Error(`파일 가져오기 실패: ${error.message}`);
    }
  }
} 