// captureService.ts
interface CaptureData {
    timestamp: string;
    image: string;
    memosId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';
console.log('[Vemo] API URL:', API_URL);

// 이미지 최적화 함수 수정
async function optimizeImage(dataUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // 최본 크기의 30%로 더 많이 축소
            const width = img.width * 0.3;
            const height = img.height * 0.3;
            
            canvas.width = width;
            canvas.height = height;
            
            ctx?.drawImage(img, 0, 0, width, height);
            
            // JPEG 품질을 40%로 낮춤
            const optimizedImage = canvas.toDataURL('image/jpeg', 0.4);
            
            // 이미지 크기 로깅
            console.log('[Vemo] 이미지 최적화:', {
                originalSize: Math.round(dataUrl.length / 1024) + 'KB',
                optimizedSize: Math.round(optimizedImage.length / 1024) + 'KB'
            });
            
            resolve(optimizedImage);
        };
        img.onerror = reject;
        img.src = dataUrl;
    });
}

export const captureService = {
    async createCapture(data: CaptureData) {
        try {
            console.log('[Vemo] 캡처 데이터 전송 시작');
            
            if (!data.timestamp || !data.image || !data.memosId) {
                throw new Error('필수 값이 누락되었습니다. timestamp, image, memosId를 확인하세요.');
            }

            // 이미지 최적화
            const optimizedImage = await optimizeImage(data.image);
            
            const token = sessionStorage.getItem('token');
            const response = await fetch(`${API_URL}/captures`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    timestamp: data.timestamp,
                    image: optimizedImage,
                    memosId: data.memosId
                })
            });

            if (!response.ok) {
                throw new Error(`캡처 생성 실패: ${response.status}`);
            }

            const result = await response.json();
            console.log('[Vemo] 캡처 생성 성공:', result);
            return result;
        } catch (error) {
            console.error('[Vemo] 캡처 서비스 에러:', error);
            throw error;
        }
    }
}; 