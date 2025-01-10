'use client';

import { useState } from 'react';
import { useSummary } from '../../context/SummaryContext';
import styles from '../sideBarNav/sideBarNav.module.css';
import Image from 'next/image';

interface SummaryButtonProps {
    videoId: string;
}

export default function SummaryButton({ videoId }: SummaryButtonProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setSummaryData, setQuizData, resetData } = useSummary();

    const formatTimestamp = (timestamp: string | Date | null) => {
        if (!timestamp) return '00:00';

        // 이미 'MM:SS' 형식인 경우
        if (typeof timestamp === 'string' && /^\d{1,2}:\d{2}$/.test(timestamp)) {
            return timestamp;
        }

        try {
            let minutes = 0;
            let seconds = 0;

            if (typeof timestamp === 'string') {
                if (timestamp === 'NaN:NaN') {
                    return '00:00';
                }
                // 'HH:MM:SS' 형식� 경우
                if (timestamp.includes(':')) {
                    const parts = timestamp.split(':').map(Number);
                    if (parts.length === 3) {
                        minutes = parts[1];
                        seconds = parts[2];
                    } else if (parts.length === 2) {
                        minutes = parts[0];
                        seconds = parts[1];
                    }
                } else {
                    // 숫자 문자열� 경우 (초 단위)
                    const totalSeconds = parseInt(timestamp, 10);
                    minutes = Math.floor(totalSeconds / 60);
                    seconds = totalSeconds % 60;
                }
            } else if (timestamp instanceof Date) {
                minutes = timestamp.getMinutes();
                seconds = timestamp.getSeconds();
            }

            // 유효한 숫자가 아닌 경우
            if (isNaN(minutes) || isNaN(seconds)) {
                return '00:00';
            }

            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        } catch (error) {
            console.error('타임스탬�� 변환 오류:', error);
            return '00:00';
        }
    };

    const handleClick = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // 요청 전에 이전 데이터 초기화
            resetData();

            // 첫 번째 요청: 타임스탬프와 디스크립션
            const timestampResponse = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/summarization`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId }),
                },
            );

            if (!timestampResponse.ok) {
                const errorData = await timestampResponse.json();
                throw new Error(errorData.message || '타임스탬프 요청 실패');
            }

            const summaryList = await timestampResponse.json();
            console.log('타임스탬프 응답 데이터:', summaryList);

            // 두 번째 요청: 퀴즈와 퀴즈타임스탬프 및 정답
            const quizResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/quiz`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ videoId }),
            });

            if (!quizResponse.ok) {
                const errorData = await quizResponse.json();
                throw new Error(errorData.message || '퀴즈 요청 실패');
            }

            const rawQuizData = await quizResponse.json();
            console.log('퀴즈 응답 데이터:', rawQuizData);

            // 두 데이터가 모두 설정되었는지 확인
            if (summaryList && rawQuizData) {
                setSummaryData({
                    summaryList: summaryList.map((item: any) => ({
                        id: item.id,
                        timestamp: formatTimestamp(item.timestamp),
                        description: item.summary,
                    })),
                });
                setQuizData({ quizList: rawQuizData });

                alert('요약 및 퀴즈 데이터가 저장되었습니다.');
            }
        } catch (err) {
            console.error('요청 오류:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <button onClick={handleClick} disabled={isSubmitting} className={styles.iconButton}>
                <Image
                    className={styles.defaultIcon}
                    src="/icons/bt_edit_nav_AiSummery.svg"
                    alt="요약"
                    width={20}
                    height={20}
                />

                <span className={styles.iconButtonText}>
                    {isSubmitting ? '전송 중...' : '요약하기'}
                </span>
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
    );
}
