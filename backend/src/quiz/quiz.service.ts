import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { SubtitleDto } from './dto/subtitle.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Quizzes } from './entity/quizzes.entity';
import { Quiz } from './entity/quiz.entity';
import { Repository } from 'typeorm';
import { QuizResultDto } from './dto/quizResult.dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class QuizService {
    private readonly openai: OpenAI;

    constructor(
        @InjectRepository(Quizzes)
        private quizzesRepository: Repository<Quizzes>,

        @InjectRepository(Quiz)
        private quizRepository: Repository<Quiz>,

        private configService: ConfigService,
        private readonly httpService: HttpService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async fetchData(videoId: string): Promise<any> {
        const url = `http://15.164.244.154:5050/subtitles?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
        try {
            const response = await firstValueFrom(
                this.httpService.get(url, {
                    headers: {
                        'User-Agent': 'curl/7.68.0', // curl과 동일한 User-Agent 설정
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                }),
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching data:', error.message, error.response?.data);
            throw new Error('Failed to fetch data from API');
        }
    }

    // 퀴즈 추출하는 함수
    // 형태 : [타임스탬프, 문제, 정답]
    async extractQuiz(subtitles: SubtitleDto[], videoid: string): Promise<any> {
        if (await this.findQuiz(videoid)) {
            const quiz = await this.getQuiz(videoid); // `await`으로 결과를 가져옴
            return quiz;
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
                            1. **퀴즈**: 영상의 중요 내용을 묻는 5개의 퀴즈와 타임스탬프, (O/X) 정답을 작성하세요.  
                            2. 타임스탬프는 반드시 [hh:mm] 형태로 작성하세요. 
                            3. 영상 자막을 기반으로 영상의 핵심을 찾아 퀴즈로 만들어주세요.
                            4. 다음 예시 외의 다른 형식은 작성하지 마세요.
                            
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

            // respense 값 전처리하여 DB에 데이터 create
            // console.log(response.choices[0]?.message?.content);

            const result: QuizResultDto[] = this.parseQuizToArray(
                response.choices[0]?.message?.content,
            ).map(
                ([timestamp, question, answer]) => new QuizResultDto(timestamp, question, answer),
            );

            const MAX_RETRIES = 3; // 최대 재시도 횟수
            let attempts = 0;

            while (attempts < MAX_RETRIES) {
                try {
                    // DB에 데이터 저장 시도
                    await this.createQuizzes(videoid, result);
                    console.log(`Successfully saved quizzes after ${attempts + 1} attempt(s).`);
                    break; // 저장 성공 시 루프 종료
                } catch (error) {
                    attempts++;
                    console.error(`Attempt ${attempts} failed:`, error.message);

                    if (attempts >= MAX_RETRIES) {
                        console.error('Failed to save quizzes after maximum retries.');
                        throw new Error('Could not save quizzes to the database.');
                    }
                }
            }

            const quiz = await this.getQuiz(videoid);
            return quiz;
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
        const regex = /\[(\d{1,2}:\d{2})\]\s*문제\:\s*(.*?)\s*정답\:\s*([OX])/gi;
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

    // 퀴즈를 DB에 저장 (Quizzes & Quiz 테이블)
    // 퀴즈 데이터 생성 및 저장
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
            // `quiz.timestamp`이 Date 객체라면 문자열로 변환
            const timestampString =
                quiz.timestamp instanceof Date
                    ? quiz.timestamp.toISOString().slice(11, 19) // "HH:mm:ss" 형식
                    : quiz.timestamp; // 이미 문자열인 경우 그대로 사용

            // "HH:mm:ss"에서 분:초만 추출
            const timestampParts = timestampString.split(':');
            const minutes = timestampParts[1]; // "00"
            const seconds = timestampParts[2]; // "03"

            return {
                ...quiz,
                timestamp: `${minutes}:${seconds}`, // "00:03"
            };
        });
    }
}
