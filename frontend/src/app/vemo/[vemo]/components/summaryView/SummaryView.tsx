'use client';

import { useEffect, useState } from 'react';

// Define the props interface
interface SummaryViewProps {
    videoId: string; // Specify the type of videoId
}

export default function SummaryView({ videoId }: SummaryViewProps) {
    const [summaryData, setSummaryData] = useState<any>(null); // You can specify a more specific type if known
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const response = await fetch('/api/quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoId }),
                });
                const data = await response.json();
                setSummaryData(data);
            } catch (err) {
                setError('데이터를 가져오는 데 실패했습니다.');
            }
        };

        fetchSummary();
    }, [videoId]);

    if (error) return <div>{error}</div>;
    if (!summaryData) return <div>로딩 중...</div>;

    return (
        <div>
            <h2>요약 및 퀴즈</h2>
            <p>{summaryData.url}</p> {/* S3 URL 표시 */}
        </div>
    );
}
