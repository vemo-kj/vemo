'use client';

import { useSummary } from '../../context/SummaryContext';
import styles from './summaryView.module.css';

interface SummaryViewProps {
    onTimestampClick?: (timestamp: string) => void;
}

export default function SummaryView({ onTimestampClick }: SummaryViewProps) {
    const { summaryData } = useSummary();

    if (!summaryData) {
        return <div className={styles.noData}>요약 데이터가 없습니다. 요약하기 버튼을 눌러주세요.</div>;
    }

    const handleTimestampClick = (timestamp: string) => {
        if (onTimestampClick) {
            onTimestampClick(timestamp);
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>영상 요약</h2>
            <div className={styles.summaryList}>
                {summaryData.summaryList.map((item, index) => (
                    <div key={item.id || index} className={styles.summaryItem}>
                        <div
                            className={styles.timestamp}
                            onClick={() => handleTimestampClick(item.timestamp)}
                            style={{ cursor: 'pointer' }}
                        >
                            {item.timestamp}
                        </div>
                        <div className={styles.description}>{item.description}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
