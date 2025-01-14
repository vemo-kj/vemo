import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './DrawingCanvas.module.css';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import DynamicReactSketchCanvas from './DynamicReactSketchCanvas'; // 래퍼 컴포넌트 임포트

type BrushType = 'pen' | 'highlighter' | 'eraser';

interface DrawingCanvasProps {
  backgroundImage: string; // (URL, base64, data:image/...)
  captureId?: string;
  onSave: (editedImageUrl: string, captureId?: string) => void;
  onClose: () => void;
  onRefetch?: () => void;
}

export default function DrawingCanvas({
  backgroundImage,
  captureId,
  onSave,
  onClose,
  onRefetch,
}: DrawingCanvasProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  // 드로잉 옵션
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [brushType, setBrushType] = useState<BrushType>('pen');
  const [opacity, setOpacity] = useState(1);

  // 배경 이미지 크기
  const [canvasWidth, setCanvasWidth] = useState(1280);
  const [canvasHeight, setCanvasHeight] = useState(720);

  // 이동/확대
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMovingMode, setIsMovingMode] = useState(false);

  const widthPresets = [
    { width: 2, icon: '•' },
    { width: 5, icon: '⚪' },
    { width: 10, icon: '⭕' },
  ];

  const colorPresets = [
    { color: '#000000', name: '검정' },
    { color: '#FFFFFF', name: '하양' },
    { color: '#4A90E2', name: '파랑' },
    { color: '#7ED321', name: '초록' },
    { color: '#FF5252', name: '빨강' },
    { color: '#FFC107', name: '노랑' },
  ];

  const brushPresets = [
    { type: 'pen', name: '펜', icon: '✏️', width: 3 },
    { type: 'highlighter', name: '형광펜', icon: '🖍️', width: 30 },
    { type: 'eraser', name: '지우개', icon: '🧽', width: 20 },
  ];

  // 브러시 색상
  const getStrokeColor = () => {
    if (brushType === 'eraser') {
      return 'transparent';
    }
    if (brushType === 'highlighter') {
      const r = parseInt(strokeColor.slice(1, 3), 16);
      const g = parseInt(strokeColor.slice(3, 5), 16);
      const b = parseInt(strokeColor.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return strokeColor;
  };

  const handleBrushChange = (preset: (typeof brushPresets)[0]) => {
    setBrushType(preset.type as BrushType);
    setStrokeWidth(preset.width);
    if (preset.type === 'eraser') {
      canvasRef.current?.eraseMode(true);
      setStrokeColor('transparent');
    } else {
      canvasRef.current?.eraseMode(false);
      setStrokeColor('#000000');
      setOpacity(preset.type === 'highlighter' ? 0.5 : 1);
    }
  };

  // 배경 이미지 로딩
  const loadBackgroundSize = useCallback((url: string) => {
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = url;
    });
  }, []);

  // 저장
  const handleSave = async () => {
    if (!canvasRef.current) return;
    try {
      const drawingDataUrl = await canvasRef.current.exportImage('png');
      if (!drawingDataUrl) {
        throw new Error('No image data from canvasRef');
      }

      let processedImage = drawingDataUrl;
      if (!processedImage.startsWith('data:image/')) {
        processedImage = `data:image/png;base64,${processedImage}`;
      }
      const base64Match = processedImage.match(/base64,(.+)/);
      if (base64Match && base64Match[1]) {
        processedImage = base64Match[1];
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('토큰이 없습니다. 다시 로그인해주세요.');
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/captures/${captureId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Number(captureId),
          image: processedImage,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to update capture: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      console.log('[DrawingCanvas] Update success =>', data);

      // <img> 즉시 업데이트
      const newImage = data.image || processedImage;
      const finalSrc = newImage.startsWith('http')
        ? newImage
        : `data:image/png;base64,${newImage}`;

      const imgElem = document.getElementById(`capture-${captureId}`) as HTMLImageElement;
      if (imgElem) {
        imgElem.src = finalSrc;
      }

      onClose();
      if (onRefetch) {
        await onRefetch();
      }
    } catch (err) {
      console.error('[DrawingCanvas] Save error =>', err);
      alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const [bgUrl, setBgUrl] = useState('');

  // 배경 이미지 전처리 + 원본 크기 반영
  const processedBackgroundImage = useCallback(async () => {
    if (!backgroundImage) return '';
    let finalUrl = backgroundImage;

    // base64인지 http URL인지 판단
    if (!finalUrl.startsWith('data:image/') && !finalUrl.startsWith('http')) {
      finalUrl = `data:image/png;base64,${finalUrl}`;
    }

    try {
      const { width, height } = await loadBackgroundSize(finalUrl);
      setCanvasWidth(width);
      setCanvasHeight(height);
      console.log('[DrawingCanvas] BG size =>', width, height);
    } catch (error) {
      console.error('[DrawingCanvas] Failed to load BG size =>', error);
    }
    setBgUrl(finalUrl);
    return finalUrl;
  }, [backgroundImage, loadBackgroundSize]);

  useEffect(() => {
    (async () => {
      const finalUrl = await processedBackgroundImage();
      console.log('[DrawingCanvas] final BG =>', finalUrl?.substring(0, 50));
    })();
  }, [processedBackgroundImage]);

  // 확대/축소
  const handleZoom = (type: 'in' | 'out') => {
    setScale(prev => {
      const newScale = type === 'in' ? prev * 1.2 : prev / 1.2;
      return Math.min(Math.max(newScale, 0.5), 3);
    });
  };

  // 이동(드래그)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMovingMode && e.button === 0) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && isMovingMode) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 스페이스바 이동 모드
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsMovingMode(true);
        e.preventDefault();
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

  // ESC로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // **JSX 반환 시, 소괄호로 감싸기** => Unexpected token 에러 방지
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.drawingCanvasContainer}>
          {/* 툴바 */}
          <div className={styles.toolbar}>
            <div className={styles.widthPresets}>
              {widthPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setStrokeWidth(preset.width)}
                  className={`${styles.presetButton} ${
                    strokeWidth === preset.width ? styles.active : ''
                  }`}
                >
                  {preset.icon}
                </button>
              ))}
            </div>

            <div className={styles.colorPresets}>
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => setStrokeColor(preset.color)}
                  className={`${styles.colorButton} ${
                    strokeColor === preset.color ? styles.active : ''
                  }`}
                  style={{ backgroundColor: preset.color }}
                />
              ))}
              <input
                type="color"
                value={strokeColor}
                onChange={e => setStrokeColor(e.target.value)}
                className={styles.colorPicker}
              />
            </div>

            <div className={styles.brushPresets}>
              {brushPresets.map(preset => (
                <button
                  key={preset.type}
                  onClick={() => handleBrushChange(preset)}
                  className={`${styles.presetButton} ${
                    brushType === preset.type ? styles.active : ''
                  }`}
                >
                  {preset.icon}
                </button>
              ))}
            </div>

            {brushType === 'highlighter' && (
              <div className={styles.opacity}>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={opacity}
                  onChange={e => setOpacity(Number(e.target.value))}
                />
              </div>
            )}

            <div className={styles.zoomControls}>
              <button onClick={() => handleZoom('in')}>🔍+</button>
              <button onClick={() => handleZoom('out')}>🔍-</button>
              <span>{Math.round(scale * 100)}%</span>
              <div className={styles.moveInfo}>스페이스+드래그=이동</div>
            </div>
          </div>

          {/* 캔버스 영역 */}
          <div
            className={`${styles.canvasWrapper} ${isMovingMode ? styles.movingMode : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transformOrigin: '0 0',
                transition: isDragging ? 'none' : 'transform 0.3s ease',
                cursor: isMovingMode ? 'grab' : 'default',
              }}
            >
              {console.log('[DrawingCanvas] Rendering canvas =>', {
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                bgUrl,
              })}

              <DynamicReactSketchCanvas
                ref={canvasRef}
                width={`${canvasWidth}px`}
                height={`${canvasHeight}px`}
                exportWithBackgroundImage
                strokeWidth={strokeWidth}
                strokeColor={getStrokeColor()}
                backgroundImage={bgUrl}
                canvasColor="transparent"
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button onClick={() => canvasRef.current?.undo()}>undo</button>
            <button onClick={() => canvasRef.current?.redo()}>redo</button>
            <button
              onClick={() => {
                canvasRef.current?.clearCanvas();
                setStrokeColor('#000000');
              }}
            >
              전체 지우기
            </button>
            <button onClick={handleSave}>저장</button>
            <button onClick={onClose}>닫기</button>
          </div>
        </div>
      </div>
    </div>
  );
}