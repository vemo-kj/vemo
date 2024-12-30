import React, { useRef } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import styles from './DrawingCanvas.module.css';

interface DrawingCanvasProps {
    onClose: () => void;
}

export default function DrawingCanvas({ onClose }: DrawingCanvasProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);

    const handleSave = async () => {
        if (canvasRef.current) {
            try {
                // 캔버스 데이터를 Base64 이미지로 저장
                const dataUrl = await canvasRef.current.exportImage('png');
                console.log('그리기 결과:', dataUrl);
                // TODO: 저장 로직 추가
            } catch (error) {
                console.error('이미지 저장 중 오류:', error);
            }
        }
        onClose();
    };

    const handleClear = () => {
        canvasRef.current?.clearCanvas();
    };

    const handleUndo = () => {
        canvasRef.current?.undo();
    };

    return (
        <div className={styles.drawingContainer}>
            <h2>그리기</h2>
            <ReactSketchCanvas
                ref={canvasRef}
                style={{ border: '1px solid #000', width: '800px', height: '500px' }}
                strokeColor="#ff0000"
                strokeWidth={3}
                className={styles.canvasBox}
            />
            <div className={styles.drawToolbar}>
                <button onClick={handleUndo} className={styles.button}>
                    되돌리기
                </button>
                <button onClick={handleClear} className={styles.button}>
                    지우기
                </button>
                <button onClick={handleSave} className={styles.button}>
                    저장하기
                </button>
                <button onClick={onClose} className={styles.button}>
                    닫기
                </button>
            </div>
        </div>
    );
}
