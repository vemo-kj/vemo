// components/DrawingCanvas/DrawingCanvas.tsx
import React, { useRef, useState } from 'react';
import styles from './DrawingCanvas.module.css';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import DynamicReactSketchCanvas from './DynamicReactSketchCanvas'; // 래퍼 컴포넌트 임포트

// 브러시 타입 정의
type BrushType = 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'circle';

interface DrawingCanvasProps {
    onSave: (dataUrl: string) => void;
    onClose: () => void;
    backgroundImage: string; // 추가된 부분
}

// ReactSketchCanvas를 위한 타입 정의 추가
const Canvas = ReactSketchCanvas as unknown as React.ComponentType<{
    ref: React.RefObject<ReactSketchCanvasRef>;
    style: React.CSSProperties;
    strokeColor: string;
    strokeWidth: number;
    className: string;
    backgroundImage?: string;
}>;

export default function DrawingCanvas({ onSave, onClose, backgroundImage }: DrawingCanvasProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [brushType, setBrushType] = useState<BrushType>('pen');
  const [opacity, setOpacity] = useState(1);

  const canvasWidth = 1280;
  const canvasHeight = 720;

  // 브러시 굵기 프리셋 정의
  const widthPresets = [
    { width: 2, icon: '•' },
    { width: 5, icon: '⚪' },
    { width: 10, icon: '⭕' },
  ];

  // 색상 프리셋 정의
  const colorPresets = [
    { color: '#000000', name: '검정' },
    { color: '#FFFFFF', name: '하양' },
    { color: '#4A90E2', name: '파랑' },
    { color: '#7ED321', name: '초록' },
    { color: '#FF5252', name: '빨강' },
    { color: '#FFC107', name: '노랑' },
  ];

  // 브러시 프리셋 정의
  const brushPresets = [
    { type: 'pen', name: '펜', icon: '✏️', width: 3, opacity: 1 },
    { type: 'highlighter', name: '형광펜', icon: '🖍️', width: 15, opacity: 0.5 },
    { type: 'eraser', name: '지우개', icon: '🧽', width: 20, opacity: 1 },
  ];

  const handleBrushChange = (preset: typeof brushPresets[0]) => {
    setBrushType(preset.type as BrushType);
    setStrokeWidth(preset.width);
    setOpacity(preset.opacity);

    if (preset.type === 'eraser') {
      setStrokeColor('#FFFFFF'); // 지우개일 때 색상을 흰색으로 설정
    }
  };

  const handleSave = async () => {
    if (canvasRef.current) {
      try {
        const dataUrl = await canvasRef.current.exportImage('png');
        onSave(dataUrl);
      } catch (error) {
        console.error('이미지 저장 중 오류:', error);
      }
    }
    onClose();
  };

    return (
        <div className={styles.drawingContainer}>
            <h2>그리기</h2>
            <Canvas
                ref={canvasRef}
                style={{
                    border: '1px solid #000',
                    width: `${imageDimensions.width}px`,
                    height: `${imageDimensions.height}px`,
                }}
                strokeColor="#ff0000"
                strokeWidth={3}
                className={styles.canvasBox}
                backgroundImage={backgroundImage}
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