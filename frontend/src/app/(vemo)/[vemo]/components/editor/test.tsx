import React, { useEffect, useRef } from 'react';
import styles from './editor.module.css';

interface MomoItemProps {
    id: string; // 각 메모 고유 ID (timestamp + 랜덤 등)
    timestamp: string;
    content: string;
    screenshot?: string; // 캡처 이미지
    onTimestampClick?: (timestamp: string) => void;

    // 메모 내용이 변경되었을 때 상위 컴포넌트에 알림
    onChange: (newContent: string) => void;

    // 메모를 삭제할 때 상위 컴포넌트에 알림
    onDelete: () => void;
}

export function MomoItem({
    id,
    timestamp,
    content,
    screenshot,
    onTimestampClick,
    onChange,
    onDelete,
}: MomoItemProps) {
    const contentRef = useRef<HTMLDivElement>(null);

    // contentEditable에서 수정된 내용 감지 → onBlur 시 저장
    const handleBlur = () => {
        if (!contentRef.current) return;
        const newValue = contentRef.current.textContent?.trim() || '';

        // 새 값이 공백이면 => 삭제
        if (newValue.length === 0) {
            onDelete();
        } else {
            // 공백이 아니면 onChange로 업데이트
            onChange(newValue);
        }
    };

    const handleTimestampClick = () => {
        onTimestampClick?.(timestamp);
    };

    return (
        <div className={styles.itemContainer}>
            {/* 타임스탬프 버튼 */}
            <button className={styles.timestampBtn} onClick={handleTimestampClick}>
                {timestamp}
            </button>

            {/* contentEditable 영역 (노션처럼 인라인 수정) */}
            <div
                className={styles.itemContent}
                contentEditable={true}
                suppressContentEditableWarning={true}
                onBlur={handleBlur}
                ref={contentRef}
                // 처음 마운트 시 초기값 설정
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* 스크린샷이 있으면 표시 */}
            {screenshot && (
                <img className={styles.screenshotPreview} src={screenshot} alt="screenshot" />
            )}

            {/* 삭제 버튼 (선택사항: 별도 UI) */}
            <button className={styles.deleteBtn} onClick={onDelete}>
                삭제
            </button>
        </div>
    );
}

export default MomoItem;
