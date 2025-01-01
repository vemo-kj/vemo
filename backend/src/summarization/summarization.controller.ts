import { Body, Controller, Post, Query } from '@nestjs/common';
import { SubtitlesService } from 'src/subtitles/subtitles.service';
import { SummarizationService } from './summarization.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('summarization')
export class SummarizationController {
    constructor(
        private readonly subtitlesService: SubtitlesService,
        private readonly summarizationService: SummarizationService,
    ) {}

    @Public()
@Post()
async summarizeVideo(@Body() body: { videoid: string }) {
    const { videoid } = body; // body에서 videoid를 추출
    if (!videoid) {
        throw new Error('Video ID is required'); // videoid가 없으면 에러 처리
    }

    const url = `https://www.youtube.com/watch?v=${videoid}`; // URL 생성
    try {
        const subtitles = await this.subtitlesService.getVideoSubtitles(url); // 자막 가져오기
        return this.summarizationService.extractSummary(subtitles, videoid); // 요약 추출
    } catch (error) {
        console.error('Error summarizing video:', error);
        throw new Error('Failed to summarize video'); // 에러를 처리하고 적절한 메시지 반환
    }
}
}
