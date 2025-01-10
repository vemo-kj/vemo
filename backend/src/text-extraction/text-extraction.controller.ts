import { Body, Controller, Post } from '@nestjs/common';
import { TextExtractionService } from './text-extraction.service';
import { ExtractTextDto } from './dto/text-extraction.dto';
import { Public } from '../public.decorator';

@Controller('text-extraction')
export class TextExtractionController {
    constructor(private readonly textExtractionService: TextExtractionService) { }

    @Public()
    @Post()
    async extractText(@Body() { imageUrl }: ExtractTextDto) {
        try {
            const text = await this.textExtractionService.extractTextFromUrl(imageUrl);
            return { success: true, text };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
}
