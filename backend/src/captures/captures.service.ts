import {
    Inject,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Captures } from './captures.entity';
import { CreateCapturesDto } from './dto/create-capture.dto';
import { UpdateCapturesDto } from './dto/update-capture.dto';
import { Memos } from '../memos/memos.entity';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CapturesService {
    private readonly bucketName: string;
    private readonly logger = new Logger(CapturesService.name);

    constructor(
        @InjectRepository(Memos) private readonly memosRepository: Repository<Memos>,
        @InjectRepository(Captures) private capturesRepository: Repository<Captures>,
        @Inject('S3') private readonly s3: S3,
        private readonly configService: ConfigService,
    ) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET');
    }

    async createCapture(createCapturesDto: CreateCapturesDto, isScrap = false): Promise<Captures> {
        try {
            const { memosId, image, ...rest } = createCapturesDto;
            const memos = await this.memosRepository.findOne({
                where: { id: memosId },
            });

            const captures = this.capturesRepository.create({
                ...rest,
                memos,
            });

            if (!isScrap) {
                const uploadUrl = await this.uploadBase64ToS3(createCapturesDto.image, 'captures');
                this.logger.log('uploadUrl', uploadUrl);
                captures.image = uploadUrl;
            } else {
                captures.image = image;
            }

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
                const uploadUrl = await this.uploadBase64ToS3(updateCapturesDto.image, 'captures');
                capture.image = uploadUrl;
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
