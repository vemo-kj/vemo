import React, { memo, useRef, useState, useEffect, ChangeEvent, FocusEvent, useCallback } from 'react';
import styles from './editor.module.css';
import DrawingCanvas from '../DrawingCanvas/DrawingCanvas';
import { debounce } from 'lodash';

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

    // 로컬 상태로 편집 중인 내용 관리
    const [localContent, setLocalContent] = useState(htmlContent);

    // htmlContent prop이 변경될 때만 localContent 업데이트
    useEffect(() => {
        if (!isEditing) {
            setLocalContent(htmlContent);
        }
    }, [htmlContent, isEditing]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newContent = e.currentTarget.innerHTML;
        setLocalContent(newContent);
    };

    // 편집 완료할 때
    const handleBlur = () => {
        setIsEditing(false);
        if (!contentRef.current) return;
        
        const newValue = contentRef.current.innerHTML;
        if (newValue.trim().length === 0) {
            onDelete();
        } else {
            onChangeHTML(newValue);
        }
    };

    const handleTimestampClick = () => {
        onTimestampClick?.(timestamp);
    };

    // debounce를 적용하여 잦은 상태 업데이트 방지
    const debouncedOnChangeHTML = useCallback(
        debounce((newValue: string) => {
            onChangeHTML(newValue);
        }, 300),
        [onChangeHTML]
    );

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
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onFocus={() => setIsEditing(true)}
                    onInput={handleInput}
                    onBlur={handleBlur}
                    ref={contentRef}
                    dangerouslySetInnerHTML={{ __html: localContent }}
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
