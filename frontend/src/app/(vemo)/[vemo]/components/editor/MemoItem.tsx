import React, { useRef, useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import styles from '/Users/gangsu/Desktop/VEMO/make/vemo/frontend/src/app/(vemo)/[vemo]/components/editor/editor.module.css';
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

export default function MomoItem({
    id,
    timestamp,
    htmlContent,
    screenshot,
    onTimestampClick,
    onChangeHTML,
    onDelete,
    onPauseVideo,
    isEditable, // 추가된 부분
}: MomoItemProps) {
    // ====== (1) 그리기 영역 ======
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);
    const [drawingDataUrl, setDrawingDataUrl] = useState<string | null>(null);

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

    // contentEditable에서 수정된 내용 감지 → onBlur 시 저장
    const handleBlur = () => {
        if (!contentRef.current) return;
        const newValue = contentRef.current.textContent?.trim() || '';

        // 새 값이 공백이면 => 삭제
        if (newValue.length === 0) {
            onDelete();
        } else {
            // 공백이 아니면 onChange로 업데이트
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
}
