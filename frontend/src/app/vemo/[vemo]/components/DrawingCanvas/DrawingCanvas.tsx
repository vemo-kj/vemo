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
  backgroundImage: string;
}

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
      <div className={styles.toolbar}>
        {/* 브러시 굵기 프리셋 */}
        <div className={styles.widthPresets}>
          {widthPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => setStrokeWidth(preset.width)}
              className={`${styles.presetButton} ${
                strokeWidth === preset.width ? styles.active : ''
              }`}
              title={`${preset.width}px`}
            >
              {preset.icon}
            </button>
          ))}
        </div>

        {/* 색상 프리셋 */}
        <div className={styles.colorPresets}>
          {colorPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => setStrokeColor(preset.color)}
              className={`${styles.colorButton} ${
                strokeColor === preset.color ? styles.active : ''
              }`}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className={styles.colorPicker}
            title="커스텀 색상"
          />
        </div>

        {/* 브러시 프리셋 버튼들 */}
        <div className={styles.brushPresets}>
          {brushPresets.map((preset) => (
            <button
              key={preset.type}
              onClick={() => handleBrushChange(preset)}
              className={`${styles.presetButton} ${
                brushType === preset.type ? styles.active : ''
              }`}
              title={preset.name}
            >
              {preset.icon}
            </button>
          ))}
        </div>

        {/* 투명도 조절 (형광펜용) */}
        {brushType === 'highlighter' && (
          <div className={styles.opacity}>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
            />
          </div>
        )}
      </div>

      {/* 캔버스 */}
      <div className={styles.canvasWrapper}>
        <DynamicReactSketchCanvas
          ref={canvasRef} // ref 전달
          width={`${canvasWidth}px`}
          height={`${canvasHeight}px`}
          strokeWidth={strokeWidth}
          strokeColor={brushType === 'eraser' ? 'transparent' : strokeColor}
          eraserWidth={brushType === 'eraser' ? strokeWidth : 0}
          style={{
            border: '1px solid #000',
            opacity: opacity,
          }}
          backgroundImage={backgroundImage}
          preserveBackgroundImageAspectRatio="none"
          allowOnlyPointerType="all"
          canvasColor="transparent"
          exportWithBackgroundImage={true}
          withTimestamp={false}
        />
      </div>

      {/* 액션 버튼들 */}
      <div className={styles.actions}>
        <button onClick={() => canvasRef.current?.undo()}>되돌리기</button>
        <button onClick={() => canvasRef.current?.clearCanvas()}>전체 지우기</button>
        <button onClick={handleSave}>저장</button>
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}