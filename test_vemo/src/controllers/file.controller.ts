import { Controller, Post, Get, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { S3Service } from '../services/s3.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../entities/file.entity';

@Controller('files')
export class FileController {
  constructor(
    private readonly s3Service: S3Service,
    @InjectRepository(File)
    private fileRepository: Repository<File>,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const key = `${Date.now()}-${file.originalname}`;
    const url = await this.s3Service.uploadFile(file, key);

    const fileEntity = new File();
    fileEntity.filename = file.originalname;
    fileEntity.url = url;
    fileEntity.createdAt = new Date();

    await this.fileRepository.save(fileEntity);

    return { url, message: '파일이 성공적으로 업로드되었습니다.' };
  }

  @Get(':id')
  async getFile(@Param('id') id: number) {
    return await this.fileRepository.findOne({ where: { id } });
  }
} 