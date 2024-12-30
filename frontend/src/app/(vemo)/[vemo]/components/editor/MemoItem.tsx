import React, { useRef, useState, ChangeEvent, FocusEvent } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import styles from './editor.module.css';

interface MomoItemProps {
    id: string;
    timestamp: string;
    htmlContent: string; // HTML 형식
    screenshot?: string;
    onTimestampClick?: (timestamp: string) => void;
    onChangeHTML: (newHTML: string) => void;
    onDelete: () => void;
    onPauseVideo?: () => void;
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
}: MomoItemProps) {
    // ====== (1) 그리기 영역 ======
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);
    const sigCanvasRef = useRef<SignatureCanvas | null>(null);
    // 그리기 영역 열기
    const handleOpenDrawing = () => {
        onPauseVideo?.();
        setIsDrawingOpen(true);
    };
    // 그리기 영역 닫기
    const handleCloseDrawing = () => {
        setIsDrawingOpen(false);
    };
    // 그리기 저장
    const handleSaveDrawing = () => {
        if (!sigCanvasRef.current) return;
        // 최종 데이터
        const dataUrl = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
        // “이미지 위에 그린 것” → 새로운 screenshot로 업데이트
        // 혹은 “onChangeHTML”로 htmlContent에 <img>?
        // 여기서는 단순히 screenshot를 대체 (inline approach)
        const imgElem = document.getElementById(`capture-${id}`) as HTMLImageElement;
        if (imgElem) {
            imgElem.src = dataUrl;
        }
        // 모달 닫기
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

    // const [isEditing, setIsEditing] = useState(false);
    // const [tempContent, setTempContent] = useState(htmlContent);

    // // 더블 클릭 → 수정 모드
    // const handleDoubleClick = () => {
    //     setIsEditing(true);
    // };
    // // 텍스트 변경 처리
    // const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    //     setTempContent(e.target.value);
    // };
    // // textarea가 blur(포커스 해제)될 때 → 저장 & 수정모드 해제
    // const handleFocusOut = (e: FocusEvent<HTMLTextAreaElement>) => {
    //     onChangeHTML(tempContent);
    //     setIsEditing(false);
    // };

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
                    contentEditable={true}
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
                <button className={styles.deleteBtn} onClick={onDelete}>
                    삭제
                </button>
            </div>

            {/* 4) 그리기 모달 (이미지를 배경에 깔기) */}
            {isDrawingOpen && screenshot && (
                <div className={styles.drawOverlay}>
                    <div className={styles.drawPopup}>
                        <h3>그리기</h3>
                        <SignatureCanvas
                            ref={sigCanvasRef}
                            canvasProps={{ width: 800, height: 450, className: styles.sigCanvas }}
                            penColor="red"
                            onBegin={() => {
                                // “배경이미지” 설정
                                // signatureCanvas에서 backgroundImage를 지정하려면,
                                // fromDataURL()로 호출
                                if (sigCanvasRef.current) {
                                    sigCanvasRef.current.clear();
                                    sigCanvasRef.current.fromDataURL(screenshot, {
                                        // eraseBg: false
                                    });
                                }
                            }}
                        />
                        <div className={styles.drawButtons}>
                            <button onClick={() => sigCanvasRef.current?.clear()}>지우기</button>
                            <button onClick={handleSaveDrawing}>저장하기</button>
                            <button onClick={handleCloseDrawing}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
