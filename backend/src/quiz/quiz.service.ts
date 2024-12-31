import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SubtitleDto } from './dto/subtitle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quizzes } from './entity/quizzes.entity';
import { Quiz } from './entity/quiz.entity';
import { Repository } from 'typeorm';
import { QuizResultDto } from './dto/quizResult.dto';

@Injectable()
export class QuizService {
    private readonly openai: OpenAI;

    constructor(
        @InjectRepository(Quizzes)
        private quizzesRepository: Repository<Quizzes>,

        @InjectRepository(Quiz)
        private quizRepository: Repository<Quiz>,

        private configService: ConfigService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async extractQuiz(subtitles: SubtitleDto[], videoid: string): Promise<any> {
        if (await this.findQuiz(videoid)) {
            console.log('📌퀴즈 있음 ! 그래서 db에 꺼내옴옴');
            return this.getQuiz(videoid);
        } else {
            const formattedText = this.formatSubtitles(subtitles);
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `
                        당신은 자막의 요약 및 퀴즈 생성 전문가입니다.  
                            주어진 주요 내용을 바탕으로 다음 사항을 작성하세요:                              
                            1. **퀴즈**: 영상의 중요 내용을 묻는 5개의 퀴즈와 타임스탬프, (O/X)정답을 작성하세요.  
                            2. 영상 자막을 기반으로 영상의 핵심을 찾아 퀴즈로 만들어주세요.
                            3. 다음 예시외의 다른 어떤 것도 작성하지 마세요.
                            
                            ex) 다음 퀴즈의 예시입니다.
                            [02:40]
                            문제 : 도커를 사용하여 독립된 가상 공간을 만들어 서로 다른 서비스들을 
                            각각의 컨테이너에서 돌아갈 수 있도록 하는 기술은 가상머신이다.
                            정답 : O
                        `,
                    },
                    {
                        role: 'user',
                        content: `다음 주요 내용을 기반으로 퀴즈를 생성해주세요:\n${formattedText}`,
                    },
                ],
                max_tokens: 4000,
                temperature: 0.3,
                top_p: 0.8,
            });

            const result: QuizResultDto[] = this.parseQuizToArray(
                response.choices[0]?.message?.content,
            ).map(
                ([timestamp, question, answer]) => new QuizResultDto(timestamp, question, answer),
            );

            // DB에 저장
            await this.createQuizzes(videoid, result);

            const text = response.choices[0]?.message?.content;

            const parsedQuiz = this.parseQuizToArray(text);
            console.log('✨', this.findQuiz(videoid));

            console.log('📌퀴즈 없음 ! 그래서 db에 넣음');

            return parsedQuiz;
        }
    }
    catch(error) {
        throw new BadRequestException(`퀴즈 생성 실패: ${error.message}`);
    }

    // 타임라인과 함께 자막 텍스트 결합
    private formatSubtitles(subtitles: SubtitleDto[]): string {
        return subtitles.map(sub => `[${sub.startTime} ~ ${sub.endTime}] ${sub.text}`).join('\n');
    }

    // 퀴즈의 타임스탬프/문제/정답로 파싱한 배열열
    private parseQuizToArray(text: string): string[][] {
        const regex = /\[(\d{2}:\d{2})\]\s*문제:\s*(.*?)\s*정답:\s*(O|X)/g;
        let match;
        const result: string[][] = [];

        while ((match = regex.exec(text)) !== null) {
            const [, timestamp, question, answer] = match;
            result.push([timestamp, question, answer]);
        }
        return result;
    }

    // string 형태의 timestamp를 Date형태로 변환
    private convertToTime(timestamp: string): Date {
        const [minutes, seconds] = timestamp.split(':').map(Number);
        const date = new Date();
        date.setHours(0, minutes, seconds, 0);
        return date;
    }

    // 요약본을 DB에 저장 (Quizzes & Quiz 테이블)
    // 퀴즈 데이터 생성 및 저장 메서드
    private async createQuizzes(
        videoid: string,
        result: { timestamp: string; question: string; answer: string }[],
    ): Promise<void> {
        const newQuizzes = this.quizzesRepository.create({ videoid });

        const quizzes = result.map(data => {
            const quiz = this.quizRepository.create({
                timestamp: this.convertToTime(data.timestamp),
                question: data.question,
                answer: data.answer,
            });
            quiz.quizzes = newQuizzes;
            return quiz;
        });

        newQuizzes.quizzes = quizzes;
        await this.quizzesRepository.save(newQuizzes);
    }

    // Quizzes 테이블에서 videoid 찾기기
    private async findQuiz(videoid: string): Promise<boolean> {
        const existingQuiz = await this.quizzesRepository.findOne({
            where: { videoid },
        });

        return existingQuiz ? true : false;
    }

    // Quizzes 테이블에서 videoid 가져오기
    private async getQuiz(videoid: string): Promise<any[]> {
        const existingQuiz = await this.quizzesRepository.findOne({
            where: { videoid },
            relations: ['quizzes'],
        });

        if (!existingQuiz) return [];

        return existingQuiz.quizzes.map(quiz => {
            const date = new Date(quiz.timestamp);
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return {
                ...quiz,
                timestamp: `${minutes}:${seconds}`,
            };
        });
    }
}
