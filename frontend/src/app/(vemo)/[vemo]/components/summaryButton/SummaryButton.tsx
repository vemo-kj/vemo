'use client';

import { useState } from 'react';
import { useSummary } from '../../context/SummaryContext'

export default function SummaryButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSummaryData } = useSummary(); // Context에서 데이터 저장 함수 가져오기

  const handleClick = async () => {
    setIsSubmitting(true);
    setError(null);

    const data = {
      timeStamp: '00:01:23',
      description: '이 부분은 중요한 개념 설명입니다.',
      quizTimeStamp: '00:01:45',
      quiz: '이 개념과 관련된 문제를 설명하세요.',
    };

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '요청 실패');
      }

      const result = await response.json();
      setSummaryData(result); // 서버 응답 데이터를 Context에 저장
      alert('요약 데이터가 저장되었습니다.');
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