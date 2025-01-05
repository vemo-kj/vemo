import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class TextExtractionService {
    private readonly apiKey: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get<string>('GOOGLE_VISION_API_KEY', '');
        if (!this.apiKey) {
            throw new Error('Google Vision API 키가 설정되지 않았습니다.');
        }
    }

    /**
     * Base64 인코딩된 이미지를 Vision API로 보내 텍스트를 추출한다.
     * @param imageBase64 Base64 인코딩된 이미지(헤더 제거 전 포함 가능)
     * @returns 추출된 텍스트 (없으면 빈 문자열)
     */
    async extractTextFromBase64(imageBase64: string): Promise<string> {
        try {
            // data:image/png;base64, 등 헤더 제거 (정규식)
            const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

            // Vision API 엔드포인트
            const url = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;

            // Vision API 요청에 맞게 payload 구성
            const requestPayload = {
                requests: [
                    {
                        image: { content: cleanBase64 },
                        features: [{ type: 'TEXT_DETECTION' }],
                    },
                ],
            };

            // Google Vision API 호출
            const response = await axios.post(url, requestPayload);

            // 응답에서 텍스트 추출
            const annotations = response.data.responses[0]?.textAnnotations;
            if (annotations && annotations.length > 0) {
                return annotations[0].description; // 감지된 전체 텍스트
            }

            return ''; // 텍스트를 찾지 못한 경우
        } catch (error) {
            // Google Vision API 에러 메시지
            const errorMessage =
                error.response?.data?.error?.message || error.message || 'Unknown error';
            throw new Error(`Text extraction failed: ${errorMessage}`);
        }
    }
}
