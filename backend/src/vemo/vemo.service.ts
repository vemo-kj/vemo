import { Injectable, NotFoundException } from '@nestjs/common';
import { VideoService } from '../video/video.service';
import { MemosService } from '../memos/memos.service';
import { CreateMemosDto } from '../memos/dto/create-memos.dto';
import { Video } from '../video/video.entity';
import { Memos } from '../memos/memos.entity';
import { CreateMemosResponseDto } from './dto/create-memos-response.dto';
import { GetCommunityMemosResponseDto } from './dto/get-community-memos-response.dto';
import { GetCommunityMemosDto } from './dto/get-community-memos.dto';

@Injectable()
export class VemoService {
    constructor(
        private readonly videoService: VideoService,
        private readonly memosService: MemosService,
    ) {}

    /**
     * 특정 비디오에 메모를 작성하고, 비디오와 생성된 메모를 반환합니다.
     * @param videoId 비디오 ID
     * @param createMemosDto 메모 작성 DTO
     * @returns CreateMemoResponseDto
     */
    async createMemosForVideo(
        videoId: string,
        createMemosDto: CreateMemosDto,
    ): Promise<CreateMemosResponseDto> {
        const video: Video = await this.videoService.getVideoById(videoId);
        if (!video) {
            throw new NotFoundException(`Video with ID ${videoId} not found`);
        }

        // 메모 생성
        const memos: Memos = await this.memosService.createMemos({
            ...createMemosDto,
            videoId, // videoId를 서비스 메서드에 전달
        });

        return {
            video,
            memos,
        };
    }

    /**
     * 커뮤니티 메모 조회
     * @param videoId 비디오 ID
     * @param getCommunityMemosDto 조회 옵션 DTO
     * @returns GetCommunityMemosResponseDto
     */
    async getCommunityMemos(
        videoId: string,
        getCommunityMemosDto: GetCommunityMemosDto,
    ): Promise<GetCommunityMemosResponseDto> {
        const { filter, userId } = getCommunityMemosDto;

        let memos: Memos[];

        if (filter === 'mine') {
            if (!userId) {
                throw new NotFoundException('User ID is required to filter my memos');
            }
            memos = await this.memosService.getAllMemosByVideo(videoId);
            memos = memos.filter(memo => memo.user.id === userId);
        } else {
            memos = await this.memosService.getAllMemosByVideo(videoId);
        }

        return { memos };
    }
}
