// /components/DrawingCanvas.tsx
import React, { useRef } from 'react';
import CanvasDraw from 'react-canvas-draw'; // [추가] 라이브러리 설치 필요: npm install react-canvas-draw
import styles from './DrawingCanvas.module.css'; // 스타일은 적절히 작성

interface DrawingCanvasProps {
    onClose: () => void;
}

export default function DrawingCanvas({ onClose }: DrawingCanvasProps) {
    const canvasRef = useRef<CanvasDraw | null>(null);

    const handleSave = () => {
        if (canvasRef.current) {
            // 캔버스 이미지 DataURL
            const dataUrl = canvasRef.current.getDataURL('png');
            // TODO: 저장 로직
            // 예: parent로 콜백을 전달해서 note item으로 추가할 수도 있음
            // 여기서는 단순히 콘솔 출력
            console.log('그리기 결과:', dataUrl);
        }
        onClose();
    };

    const handleClear = () => {
        canvasRef.current?.clear();
    };
    const handleUndo = () => {
        canvasRef.current?.undo();
    };

    return (
        <div className={styles.drawingContainer}>
            <h2>그리기</h2>
            <CanvasDraw
                ref={canvasRef}
                brushColor="#ff0000"
                brushRadius={3}
                canvasWidth={800}
                canvasHeight={500}
                lazyRadius={2}
                className={styles.canvasBox}
            />
            <div className={styles.drawToolbar}>
                <button onClick={handleUndo}>되돌리기</button>
                <button onClick={handleClear}>지우기</button>
                <button onClick={handleSave}>저장하기</button>
                <button onClick={onClose}>닫기</button>
            </div>
        </div>
    );
}
