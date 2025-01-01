import React, { memo, useRef, useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import styles from './editor.module.css';
import DrawingCanvas from '../DrawingCanvas/DrawingCanvas';

interface MomoItemProps {
    id: string;
    timestamp: string;
    htmlContent: string; // HTML 형식
    screenshot?: string;
    onTimestampClick?: (timestamp: string) => void;
    onChangeHTML: (newHTML: string) => void;
    onDelete: () => void;
    onPauseVideo?: () => void;
    isEditable: boolean; // 추가된 부분
}

const MemoItem = memo(({
    id,
    timestamp,
    htmlContent,
    screenshot,
    onTimestampClick,
    onChangeHTML,
    onDelete,
    onPauseVideo,
    isEditable, // 추가된 부분
}: MomoItemProps) => {
    // ====== (1) 그리기 영역 ======
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);

    // 그리기 영역 열기
    const handleOpenDrawing = () => {
        onPauseVideo?.();
        setIsDrawingOpen(true);
    };

    // 그리기 영역 닫기
    const handleCloseDrawing = () => {
        setIsDrawingOpen(false);
    };

    // 그리기 저장 핸들러
    const handleSaveDrawing = (dataUrl: string) => {
        const imgElem = document.getElementById(`capture-${id}`) as HTMLImageElement;
        if (imgElem) {
            imgElem.src = dataUrl;
            imgElem.style.width = '100%';
            imgElem.style.height = '100%';
            imgElem.style.objectFit = 'cover';
        }
        setIsDrawingOpen(false);
    };

    // ====== (2) 텍스트 편집 ======
    const contentRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);

    // 편집 시작할 때
    const handleFocus = () => {
        setIsEditing(true);
    };

    // 편집 완료할 때
    const handleBlur = () => {
        if (!contentRef.current) return;
        setIsEditing(false);
        const newValue = contentRef.current.textContent?.trim() || '';

        if (newValue.length === 0) {
            onDelete();
        } else {
            onChangeHTML(newValue);
        }
    };

    const handleTimestampClick = () => {
        onTimestampClick?.(timestamp);
    };

    return (
        <div className={styles.memoItemContainer}>
            {/* 1) 상단에 타임스탬프 */}
            <div className={styles.memoHeader}>
                <button
                    className={styles.timestampBtn}
                    onClick={() => onTimestampClick?.(timestamp)}
                >
                    {timestamp}
                </button>
            </div>

            {/* 2) 중앙 영역: 이미지 or HTML */}
            {/* contentEditable 영역 (노션처럼 인라인 수정) */}
            {screenshot ? (
                <img
                    id={`capture-${id}`}
                    src={screenshot}
                    alt="capture"
                    className={styles.captureImage} // width:100%
                />
            ) : (
                <div
                    className={styles.itemContent}
                    // contentEditable={true}
                    contentEditable={isEditable} // 수정된 부분
                    suppressContentEditableWarning={true}
                    onBlur={handleBlur}
                    ref={contentRef}
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            )}

            {/* 3) 하단에 그리기, 삭제 버튼 */}
            <div className={styles.memoFooter}>
                {screenshot && (
                    <button className={styles.drawBtn} onClick={handleOpenDrawing}>
                        그리기
                    </button>
                )}
                <button className="style export">추출하기</button>
                <button className={styles.deleteBtn} onClick={onDelete}>
                    삭제
                </button>
            </div>

            {/* 4) 그리기 모달 (DrawingCanvas로 교체) */}
            {isDrawingOpen && screenshot && (
                <div className={styles.drawOverlay}>
                    <div className={styles.drawPopup}>
                        <h3>그리기</h3>
                        <DrawingCanvas
                            onSave={handleSaveDrawing}
                            onClose={handleCloseDrawing}
                            backgroundImage={screenshot} // 배경 이미지 전달
                        />
                    </div>
                </div>
            )}
        </div>
    );
});

MemoItem.displayName = 'MemoItem';

export default MemoItem;
