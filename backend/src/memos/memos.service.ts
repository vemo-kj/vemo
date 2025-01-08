import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memos } from './memos.entity';
import { UpdateMemosDto } from './dto/update-memos.dto';
import { Video } from '../video/video.entity';
import { Users } from '../users/users.entity';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class MemosService {
    private readonly logger = new Logger(MemosService.name);
    private readonly redisClient: Redis;

    constructor(
        @InjectRepository(Memos) private readonly memosRepository: Repository<Memos>,
<<<<<<< HEAD
        @InjectRepository(Users) private readonly userRepository: Repository<Users>,
        @InjectRepository(Video) private readonly videoRepository: Repository<Video>,
    ) { }
=======
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly configService: ConfigService,
    ) {
        this.redisClient = new Redis({
            host: this.configService.get<string>('REDIS_HOST', 'localhost'),
            port: this.configService.get<number>('REDIS_PORT', 6379),
            password: this.configService.get<string>('REDIS_PASSWORD'),
        });
    }
>>>>>>> 0219246c9f9663094ece87dbb6ecc496f0ea54f3

    async createMemos(title: string, videoId: string, userId: number): Promise<Memos> {
        try {
            // 먼저 기본 데이터 저장
            const savedMemos = await this.memosRepository.save({
                title,
                video: { id: videoId },
                user: { id: userId },
            });

            // relations를 포함하여 저장된 데이터 조회
            const memos = await this.memosRepository.findOne({
                where: { id: savedMemos.id },
                relations: ['user', 'video', 'video.channel', 'memo', 'capture'],
            });

            if (!memos) {
                throw new InternalServerErrorException('Failed to retrieve created memos');
            }

            await this.invalidateVemoCount(videoId);
            return memos;
        } catch (error) {
            throw new InternalServerErrorException('Failed to create memos');
        }
    }

    /**
     * 특정 비디오에 대한 메모 개수를 반환.
     * Redis 캐시를 먼저 확인하고, 없으면 DB에서 조회 후 캐시에 저장
     * @param videoId 비디오 ID
     * @returns 메모 개수
     */
    async getVemoCountByVideo(videoId: string): Promise<number> {
        const cacheKey = `vemo:count:${videoId}`;

        try {
            // 캐시에서 메모 수 확인
            const cachedCount = await this.cacheManager.get<number>(cacheKey);

            if (cachedCount !== undefined) {
                return cachedCount;
            }

            // DB에서 메모 수 조회
            const count = await this.memosRepository.count({
                where: { video: { id: videoId } },
            });

            // 캐시에 메모 수 저장 (1시간 TTL)
            await this.cacheManager.set(cacheKey, count, 3600);

            return count;
        } catch (error) {
            this.logger.error(`Failed to get vemo count for video ${videoId}`, error);
            throw new InternalServerErrorException('Failed to get vemo count');
        }
    }

    /**
     * 메모 생성/수정/삭제 시 캐시 무효화
     * @param videoId 비디오 ID
     */
    private async invalidateVemoCount(videoId: string): Promise<void> {
        const cacheKey = `vemo:count:${videoId}`;
        try {
            await this.cacheManager.del(cacheKey);
        } catch (error) {
            this.logger.error(`Failed to invalidate vemo count cache for video ${videoId}`, error);
        }
    }

    async getAllMemosByUser(userId: number): Promise<Memos[]> {
        return await this.memosRepository.find({
            where: { user: { id: userId } },
            relations: ['video', 'memos'],
        });
    }

    async getAllMemosByVideo(videoId: string): Promise<Memos[]> {
        try {
            return await this.memosRepository.find({
                where: { video: { id: videoId } },
                relations: ['user', 'video', 'video.channel', 'memo', 'capture'],
                order: {
                    createdAt: 'DESC',
                },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to get all memos by video', {
                cause: error,
            });
        }
    }

    async getMemosById(memosId: number): Promise<Memos> {
        try {
            const memos = await this.memosRepository.findOne({
                where: { id: memosId },
                relations: ['user', 'video', 'memo', 'capture', 'video.channel'],
            });

            if (!memos) {
                throw new NotFoundException(`Memos with ID ${memosId} not found`);
            }

            return memos;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to get memos', {
                cause: error,
            });
        }
    }

    async updateMemos(id: number, updateMemosDto: UpdateMemosDto): Promise<Memos> {
        const memos = await this.memosRepository.findOne({ where: { id } });
        if (!memos) throw new NotFoundException(`Memos with ID ${id} not found`);

        Object.assign(memos, updateMemosDto);
        return await this.memosRepository.save(memos);
    }

    async deleteMemos(id: number): Promise<void> {
        const memos = await this.memosRepository.findOne({
            where: { id },
            relations: ['video'],
        });

        if (!memos) {
            throw new NotFoundException(`Memos with ID ${id} not found`);
        }

        const result = await this.memosRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Memos with ID ${id} not found`);
        }

        await this.invalidateVemoCount(memos.video.id);
    }

    async getMemosByVideoAndUser(videoId: string, userId: number): Promise<Memos[]> {
        try {
            return await this.memosRepository.find({
                where: {
                    video: { id: videoId },
                    user: { id: userId },
                },
                relations: ['user', 'video', 'video.channel', 'memo', 'capture'],
                order: {
                    createdAt: 'DESC',
                },
            });
        } catch (error) {
            throw new InternalServerErrorException('Failed to get memos by video and user', {
                cause: error,
            });
        }
    }
}
