'use client';

import { useState } from 'react';
import { useSummary } from '../../context/SummaryContext';

export default function SummaryButton() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setSummaryData, setQuizData } = useSummary(); // Context에서 데이터 저장 함수 가져오기

    const handleClick = async () => {
        setIsSubmitting(true);
        setError(null);

        const videoId = '7DwxuWyCNHA'; // 이 부분을 실제 비디오 ID로 대체해야 함

        try {
            // 첫 번째 요청: 타임스탬프와 디스크립션
            const timestampResponse = await fetch('http://localhost:5050/summarization', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId }),
            });

            console.log(JSON.stringify({ videoId }));

            if (!timestampResponse.ok) {
                const errorData = await timestampResponse.json();
                throw new Error(errorData.message || '타임스탬프 요청 실패');
            }

            const timestampData = await timestampResponse.json();

            // 두 번째 요청: 퀴즈와 퀴즈타임스탬프 및 정답
            const quizResponse = await fetch('http://localhost:5050/quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId }),
            });

            if (!quizResponse.ok) {
                const errorData = await quizResponse.json();
                throw new Error(errorData.message || '퀴즈 요청 실패');
            }

            const quizData = await quizResponse.json();

            // Context에 데이터 저장
            setSummaryData({
                timeStamp: timestampData.timeStamp,
                description: timestampData.description,
            });

            setQuizData({
                quizTimeStamp: quizData.quizTimeStamp,
                quiz: quizData.quiz,
                answer: quizData.answer,
            });

            console.log(setSummaryData, setQuizData);

            alert('요약 및 퀴즈 데이터가 저장되었습니다.');
        } catch (err) {
            console.error('요청 오류:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <button onClick={handleClick} disabled={isSubmitting}>
                {isSubmitting ? '전송 중...' : '요약하기'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}
