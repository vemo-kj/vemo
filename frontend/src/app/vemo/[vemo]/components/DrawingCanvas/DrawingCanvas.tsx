// components/DrawingCanvas/DrawingCanvas.tsx
import React, { useRef, useState, useEffect } from 'react';
import styles from './DrawingCanvas.module.css';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import DynamicReactSketchCanvas from './DynamicReactSketchCanvas'; // 래퍼 컴포넌트 임포트

// 브러시 타입 정의
type BrushType = 'pen' | 'highlighter' | 'eraser' | 'rectangle' | 'circle';

interface DrawingCanvasProps {
    backgroundImage: string;  // 캡처된 이미지 URL
    onSave: (editedImageUrl: string) => void;
    onClose: () => void;
}

export default function DrawingCanvas({ backgroundImage, onSave, onClose }: DrawingCanvasProps) {
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

    const handleBrushChange = (preset: (typeof brushPresets)[0]) => {
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
                // 그린 내용만 가져오기
                const drawingData = await canvasRef.current.exportImage('png');
                
                // 배경 이미지와 그린 내용 합치기
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    throw new Error('Canvas context not available');
                }

                // 이미지 크기 설정
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;

                // 배경 이미지 그리기
                const bgImg = new Image();
                bgImg.crossOrigin = 'anonymous';
                
                await new Promise<void>((resolve, reject) => {
                    bgImg.onload = () => {
                        ctx.drawImage(bgImg, 0, 0, canvasWidth, canvasHeight);
                        
                        // 그린 내용 그리기
                        const drawingImg = new Image();
                        drawingImg.onload = () => {
                            ctx.drawImage(drawingImg, 0, 0);
                            const finalImageUrl = canvas.toDataURL('image/png');
                            // 부모 콜백 onSave 호출(base64 전달)
                            onSave(finalImageUrl);
                            resolve();
                        };
                        drawingImg.onerror = reject;
                        drawingImg.src = drawingData;
                    };
                    bgImg.onerror = reject;
                    bgImg.src = backgroundImage;
                });

            } catch (error) {
                console.error('Drawing save failed:', error);
            }
        }
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
        if (isMovingMode && e.button === 0) {
            // 이동 모드이고 왼쪽 버튼일 때
            setIsDragging(true);
            setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
            e.preventDefault(); // 그리기 방지
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
        <div className={styles.drawingCanvasContainer}>
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
                        onChange={e => setStrokeColor(e.target.value)}
                        className={styles.colorPicker}
                        title="커스텀 색상"
                    />
                </div>

                {/* 브러시 프리셋 버튼들 */}
                <div className={styles.brushPresets}>
                    {brushPresets.map(preset => (
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
                            onChange={e => setOpacity(Number(e.target.value))}
                        />
                    </div>
                )}

                {/* 확대/축소 컨트롤 */}
                <div className={styles.zoomControls}>
                    <button onClick={() => handleZoom('in')} title="확대">
                        🔍+
                    </button>
                    <button onClick={() => handleZoom('out')} title="축소">
                        🔍-
                    </button>
                    <span>{Math.round(scale * 100)}%</span>
                    <div className={styles.moveInfo}>
                        스페이스바를 누른 상태에서 드래그하여 이동
                    </div>
                </div>
            </div>

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
                    <DynamicReactSketchCanvas
                        ref={canvasRef}
                        width={`${canvasWidth}px`}
                        height={`${canvasHeight}px`}
                        strokeWidth={strokeWidth}
                        strokeColor={getStrokeColor()}
                        backgroundImage={backgroundImage}
                        exportWithBackgroundImage={true}
                        canvasColor="transparent"
                    />
                </div>
            </div>

            {/* 액션 버튼들 */}
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
    );
}
