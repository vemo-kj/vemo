import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, Logger } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../services/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';

@Controller('files')
export class FileController {
  private readonly logger = new Logger(FileController.name);

  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      this.logger.log('파일 업로드 시작');
      this.logger.log(`받은 파일 정보: ${JSON.stringify({
        filename: file?.originalname,
        mimetype: file?.mimetype,
        size: file?.size
      })}`);

      const key = `${Date.now()}-${file.originalname}`;
      this.logger.log(`S3 업로드 시작 - key: ${key}`);
      
      const url = await this.s3Service.uploadFile(file, key);
      this.logger.log(`S3 업로드 완료 - url: ${url}`);

      const fileEntity = new File();
      fileEntity.filename = file.originalname;
      fileEntity.url = url;
      fileEntity.createdAt = new Date();

      const savedFile = await this.fileRepository.save(fileEntity);
      this.logger.log(`DB 저장 완료 - id: ${savedFile.id}`);

      return { 
        url, 
        message: '파일이 성공적으로 업로드되었습니다.',
        fileId: savedFile.id 
      };
    } catch (error) {
      this.logger.error('파일 업로드 실패:', error);
      throw error;
    }
  }

  @Get(':id')
  async getFile(@Param('id') id: number) {
    try {
      const file = await this.fileRepository.findOne({ where: { id } });
      if (!file) {
        this.logger.warn(`파일을 찾을 수 없음 - id: ${id}`);
        return { message: '파일을 찾을 수 없습니다.' };
      }
      return file;
    } catch (error) {
      this.logger.error(`파일 조회 실패 - id: ${id}`, error);
      throw error;
    }
  }
} 