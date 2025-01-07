import {
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Captures } from './captures.entity';
import { CreateCapturesDto } from './dto/create-capture.dto';
import { UpdateCapturesDto } from './dto/update-capture.dto';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CapturesService {
    private readonly bucketName: string;
    constructor(
        @InjectRepository(Captures)
        private capturesRepository: Repository<Captures>,

        @Inject('S3')
        private readonly s3: S3,
        private readonly configService: ConfigService,
    ) {}

    async createCapture(createCapturesDto: CreateCapturesDto): Promise<Captures> {
        try {
            const captures = this.capturesRepository.create(createCapturesDto);
            const uploadUrl = await this.uploadBase64ToS3(createCapturesDto.image, 'captures');
            // captures.image = uploadUrl;

            // 데이터베이스에 저장
            return await this.capturesRepository.save(captures);
        } catch (error) {
            throw new InternalServerErrorException('Failed to create capture', {
                cause: error,
            });
        }
    }

    async getCaptures(): Promise<Captures[]> {
        try {
            return await this.capturesRepository.find({
                relations: ['memos'],
                order: {
                    timestamp: 'ASC',
                },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to get captures', {
                cause: error,
            });
        }
    }

    async getCaptureById(id: number): Promise<Captures> {
        try {
            const capture = await this.capturesRepository.findOne({
                where: { id },
                relations: ['memos'],
            });

            if (!capture) {
                throw new NotFoundException(`Capture with ID ${id} not found`);
            }

            return capture;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to get capture', {
                cause: error,
            });
        }
    }

    async updateCapture(id: number, updateCapturesDto: UpdateCapturesDto): Promise<Captures> {
        try {
            const capture = await this.capturesRepository.findOne({
                where: { id },
                relations: ['memos'],
            });

            if (!capture) {
                throw new NotFoundException(`Capture with ID ${id} not found`);
            }

            if (updateCapturesDto.image) {
                capture.image = updateCapturesDto.image;
            }

            return await this.capturesRepository.save(capture);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to update capture', {
                cause: error,
            });
        }
    }

    async deleteCapture(id: number): Promise<void> {
        const capture = await this.capturesRepository.findOne({ where: { id } });
        if (!capture) {
            throw new NotFoundException('Capture not found', {
                cause: 'Capture not found',
            });
        }
        await this.capturesRepository.delete(id);
    }

    async uploadBase64ToS3(base64: string, folder: string): Promise<string> {
        try {
            const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
            const buffer = Buffer.from(base64Data, 'base64');

            const ext = base64.match(/data:image\/(\w+);base64/)?.[1] || 'png';
            const fileName = `${folder}/${uuidv4()}.${ext}`;

            // S3 업로드
            const uploadResult = await this.s3
                .upload({
                    Bucket: 'vemo-data-bucket',
                    Key: fileName,
                    Body: buffer,
                    ContentEncoding: 'base64',
                    ContentType: `image/${ext}`,
                })
                .promise();
            return uploadResult.Location;
        } catch (error) {
            throw new InternalServerErrorException('S3 업로드에 실패했습니다.', {
                cause: error,
            });
        }
    }
}
