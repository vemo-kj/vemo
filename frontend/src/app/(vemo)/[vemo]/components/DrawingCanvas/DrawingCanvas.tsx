// DrawingCanvas.tsx
import React, { useRef, useEffect, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import styles from './DrawingCanvas.module.css';

interface DrawingCanvasProps {
    onSave: (dataUrl: string) => void;
    onClose: () => void;
    backgroundImage: string; // 추가된 부분
}

export default function DrawingCanvas({ onSave, onClose, backgroundImage }: DrawingCanvasProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
        width: 800,
        height: 500,
    });

    useEffect(() => {
        if (backgroundImage) {
            const img = new Image();
            img.src = backgroundImage;
            img.onload = () => {
                setImageDimensions({ width: img.width, height: img.height });
            };
            img.onerror = err => {
                console.error('이미지 로드 실패:', err);
            };
        }
    }, [backgroundImage]);

    const handleSave = async () => {
        if (canvasRef.current) {
            try {
                // 캔버스 데이터를 Base64 이미지로 저장
                const dataUrl = await canvasRef.current.exportImage('png');
                console.log('그리기 결과:', dataUrl);
                onSave(dataUrl); // 저장된 이미지를 상위 컴포넌트로 전달
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
                style={{
                    border: '1px solid #000',
                    width: `${imageDimensions.width}px`,
                    height: `${imageDimensions.height}px`,
                }}
                strokeColor="#ff0000"
                strokeWidth={3}
                className={styles.canvasBox}
                backgroundImage={backgroundImage} // 배경 이미지 설정
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
