import React, { useRef, useState } from 'react';
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
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);
    const sigCanvasRef = useRef<SignatureCanvas | null>(null);

    // ============= (4) 그리기 열기 =============
    const handleOpenDrawing = () => {
        onPauseVideo?.();
        setIsDrawingOpen(true);
    };

    const handleCloseDrawing = () => {
        setIsDrawingOpen(false);
    };

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

    // ============= (3) 텍스트 편집(HTML) => blur 시 반영 =============
    // 이번엔 contentEditable이 아닌, "readonly" 표시만 하고
    // B/I/U 동작은 Draft.js에서만 하므로, 여기서는 그냥 표시용
    // 만약 “이곳에서도 인라인 수정” 원한다면, 별도 로직 필요
    // 지금은 “Draft.js -> HTML” 일방.
    // => onChangeHTML는 안 쓰고, 삭제/그리기만.

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
            {screenshot ? (
                <img
                    id={`capture-${id}`}
                    src={screenshot}
                    alt="capture"
                    className={styles.captureImage} // width:100%
                />
            ) : (
                <div
                    className={styles.memoHTML}
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
