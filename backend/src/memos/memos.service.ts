import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Memos } from './memos.entity';
import { UpdateMemosDto } from './dto/update-memos.dto';
import { Video } from '../video/video.entity';
import { Users } from '../users/users.entity';

@Injectable()
export class MemosService {
    constructor(
        @InjectRepository(Memos) private readonly memosRepository: Repository<Memos>,
        @InjectRepository(Users) private readonly userRepository: Repository<Users>,
        @InjectRepository(Video) private readonly videoRepository: Repository<Video>,
    ) {}

    async createMemos(
        memosTitle: string,
        memosDescription: string,
        videoId: string,
        userId: number,
    ): Promise<Memos> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const video = await this.videoRepository.findOne({ where: { id: videoId } });
        if (!video) {
            throw new NotFoundException(`Video with ID ${videoId} not found`);
        }

        const memos = this.memosRepository.create({
            title: memosTitle,
            description: memosDescription,
            user: user,
            video: video,
        });

        return await this.memosRepository.save(memos);
    }

    /**
     * 특정 비디오에 대한 메모 개수를 반환.
     * @param videoId 비디오 ID
     * @returns 메모 개수
     */
    async getVemoCountByVideo(videoId: string): Promise<number> {
        const count = await this.memosRepository.count({ where: { video: { id: videoId } } });
        return count;
    }

    async getAllMemosByUser(userId: number): Promise<Memos[]> {
        return await this.memosRepository.find({
            where: { user: { id: userId } },
            relations: ['video', 'memos'],
        });
    }

    async getAllMemosByVideo(videoId: string): Promise<Memos[]> {
        return await this.memosRepository.find({
            where: { video: { id: videoId } },
            relations: ['user', 'video', 'memos'],
        });
    }

    async getMemosById(memosId: number): Promise<Memos> {
        const memos = await this.memosRepository.findOne({
            where: { id: memosId },
            relations: ['user', 'video', 'memos'],
        });
        if (!memos) throw new NotFoundException(`Memos with ID ${memosId} not found`);
        return memos;
    }

    async updateMemos(id: number, updateMemosDto: UpdateMemosDto): Promise<Memos> {
        const memos = await this.memosRepository.findOne({ where: { id } });
        if (!memos) throw new NotFoundException(`Memos with ID ${id} not found`);

        Object.assign(memos, updateMemosDto);
        return await this.memosRepository.save(memos);
    }

    async deleteMemos(id: number): Promise<void> {
        const result = await this.memosRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Memos with ID ${id} not found`);
        }
    }
}
