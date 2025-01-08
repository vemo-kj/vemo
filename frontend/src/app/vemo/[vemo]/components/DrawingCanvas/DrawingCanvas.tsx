// components/DrawingCanvas/DrawingCanvas.tsx
import React, { useRef, useState, useEffect } from 'react';
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
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMovingMode, setIsMovingMode] = useState(false);

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

  const getStrokeColor = () => {
    if (brushType === 'eraser') {
      return 'transparent';
    }
    if (brushType === 'highlighter') {
      // RGBA 색상으로 변환하여 투명도 적용
      const r = parseInt(strokeColor.slice(1, 3), 16);
      const g = parseInt(strokeColor.slice(3, 5), 16);
      const b = parseInt(strokeColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return strokeColor;
  };

  const handleBrushChange = (preset: typeof brushPresets[0]) => {
    setBrushType(preset.type as BrushType);
    setStrokeWidth(preset.width);
    
    if (preset.type === 'eraser') {
      canvasRef.current?.eraseMode(true); // eraseMode 활성화
      setStrokeColor('transparent');
    } else {
      canvasRef.current?.eraseMode(false); // eraseMode 비활성화
      setStrokeColor('#000000');
      setOpacity(preset.opacity);
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

  // 확대/축소 핸들러
  const handleZoom = (type: 'in' | 'out') => {
    setScale(prevScale => {
      const newScale = type === 'in' ? prevScale * 1.2 : prevScale / 1.2;
      return Math.min(Math.max(newScale, 0.5), 3);
    });
  };

  // 마우스 이벤트 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMovingMode && e.button === 0) { // 이동 모드이고 왼쪽 버튼일 때
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault(); // 그리기 방지
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isMovingMode) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 스페이스바 누를 때 이동 모드 활성화
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsMovingMode(true);
        e.preventDefault(); // 페이지 스크롤 방지
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsMovingMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

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