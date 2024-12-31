import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SubtitleDto } from './dto/subtitle.dto';

@Injectable()
export class QuizService {
    private readonly openai: OpenAI;

    constructor(private configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async extractQuiz(subtitles: SubtitleDto[], videoid: string): Promise<any> {
        const formattedText = this.formatSubtitles(subtitles);
        const response = await this.openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `
                        당신은 자막의 요약 및 퀴즈 생성 전문가입니다.  
                            주어진 주요 내용을 바탕으로 다음 사항을 작성하세요:  
                            
                            1. **요약**: 자막의 주요 내용을 타임스탬프와 함께 정리하세요.  
                            2. **결론**: 영상의 핵심 메시지를 요약하세요.  
                            3. **퀴즈**: 영상의 중요 내용을 묻는 4개의 퀴즈와 타임스탬프, 정답을 작성하세요.  
                            ex) 다음 퀴즈의 예시입니다.
                            도커를 사용하여 독립된 가상 공간을 만들어 서로 다른 서비스들을 각각의 컨테이너에서 돌아갈 수 있도록 하는 기술은 무엇인가요?
                                a) 가상머신
                                b) 클라우드 컴퓨팅
                                c) 도커
                                d) 서버 관리"
                          `,
                },
                {
                    role: 'user',
                    content: `다음 주요 내용을 기반으로 요약과 퀴즈를 생성해주세요:\n${formattedText}`,
                },
            ],
            max_tokens: 4000,
            temperature: 0.3,
            top_p: 0.8,
        });

        const result = response.choices[0]?.message?.content;
        console.log(result);

        return result;
        // }
    }
    catch(error) {
        throw new BadRequestException(`퀴즈 생성 실패: ${error.message}`);
    }

    // 타임라인과 함께 자막 텍스트 결합
    private formatSubtitles(subtitles: SubtitleDto[]): string {
        return subtitles.map(sub => `[${sub.startTime} ~ ${sub.endTime}] ${sub.text}`).join('\n');
    }
}
