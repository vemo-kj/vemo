import { Module } from '@nestjs/common';
import { TextExtractionService } from './text-extraction.service';
import { TextExtractionController } from './text-extraction.controller';

@Module({
  controllers: [TextExtractionController],
  providers: [TextExtractionService],
})
export class TextExtractionModule {}
