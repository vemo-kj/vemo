import { Body, Controller, Post } from '@nestjs/common';
import { SubtitlesService } from 'src/subtitles/subtitles.service';
import { Public } from '../public.decorator';
import { SummarizationService } from './summarization.service';

@Controller('summarization')
export class SummarizationController {
    constructor(
        private readonly subtitlesService: SubtitlesService,
        private readonly summarizationService: SummarizationService,
    ) {}

    @Public()
    @Post()
    async summarizeVideo(@Body() body: { videoId: string }) {
        const { videoId } = body; // videoId로 추출
        if (!videoId) {
            throw new Error('Video ID is required');
        }
        try {
            const data = await this.summarizationService.fetchData(videoId);
            return this.summarizationService.extractSummary(data, videoId);
        } catch (error) {
            console.error('Error summarizing video:', error);
            throw new Error('Failed to summarize video');
        }
    }
}
