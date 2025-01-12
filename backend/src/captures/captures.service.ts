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
import { Memos } from 'src/memos/memos.entity';
import { UpdateCapturesDto } from './dto/update-capture.dto';
import { S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CapturesService {
    private readonly bucketName: string;
    private readonly logger = new Logger(CapturesService.name);

    constructor(
        @InjectRepository(Memos) private readonly memosRepository: Repository<Memos>,
        @InjectRepository(Captures) private capturesRepository: Repository<Captures>,
        @Inject('S3')
        private readonly s3: S3,

        private readonly configService: ConfigService,
    ) {
        this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    }

    /**
     * 새 캡처 생성
     *  - Base64 → S3 업로드 → DB 저장
     */
    async createCapture(createCapturesDto: CreateCapturesDto): Promise<Captures> {
        try {
            const { memosId, ...rest } = createCapturesDto;

            // (1) Memos FK 관계 매핑
            const memos = await this.memosRepository.findOne({
                where: { id: memosId },
            });

            // (2) DB 엔티티 생성
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

            // (4) DB 저장
            return await this.capturesRepository.save(captures);
        } catch (error) {
            throw new InternalServerErrorException('Failed to create capture', {
                cause: error,
            });
        }
    }

    /**
     * 전체 캡처 목록
     */
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

    /**
     * 특정 캡처 조회
     */
    async getCaptureById(id: number): Promise<Captures> {
        try {
            const capture = await this.capturesRepository.findOne({
                where: { id },
                relations: ['memos'],
            });
            this.logger.log('getCaptureById capture:', capture);

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

    /**
     * 캡처 업데이트
     *  - Base64 있을 시, S3 재업로드 후 URL로 대체
     */
    async updateCapture(id: number, updateCapturesDto: UpdateCapturesDto): Promise<Captures> {
        try {
            // (1) 기존 캡처 엔티티 조회
            const capture = await this.capturesRepository.findOne({
                where: { id },
                relations: ['memos'],
            });

            if (!capture) {
                throw new NotFoundException(`Capture with ID ${id} not found`);
            }

            // (2) 클라이언트가 보낸 Base64 이미지가 있으면 새로 업로드
            if (updateCapturesDto.image) {
                const uploadUrl = await this.uploadBase64ToS3(updateCapturesDto.image, 'captures');
                capture.image = uploadUrl;
            }

            // (3) DB 저장
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

    /**
     * 캡처 삭제
     */
    async deleteCapture(id: number): Promise<void> {
        const capture = await this.capturesRepository.findOne({ where: { id } });
        if (!capture) {
            throw new NotFoundException('Capture not found', {
                cause: 'Capture not found',
            });
        }
        await this.capturesRepository.delete(id);
    }

    /**
     * uploadBase64ToS3
     *  - data:image/... 형태의 Base64를 파싱 → S3 업로드 → 업로드된 파일 URL 반환
     */
    async uploadBase64ToS3(base64: string, folder: string): Promise<string> {
        try {
            // 1) data:image/png;base64, 이 부분 제거
            const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
            // 2) 버퍼로 변환
            const buffer = Buffer.from(base64Data, 'base64');

            // 3) 확장자 추출 (png, jpg, 등)
            const ext = base64.match(/data:image\/(\w+);base64/)?.[1] || 'png';
            // 4) 파일 이름 생성
            const fileName = `${folder}/${uuidv4()}.${ext}`;

            // 5) S3 업로드
            const uploadResult = await this.s3
                .upload({
                    Bucket: 'vemo-data-bucket',
                    Key: fileName,
                    Body: buffer,
                    ContentEncoding: 'base64',
                    ContentType: `image/${ext}`,
                })
                .promise();

            // 업로드된 S3 파일 URL
            return uploadResult.Location;
        } catch (error) {
            throw new InternalServerErrorException('S3 업로드에 실패했습니다.', {
                cause: error,
            });
        }
    }
}