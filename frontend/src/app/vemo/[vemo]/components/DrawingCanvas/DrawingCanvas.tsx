// components/DrawingCanvas/DrawingCanvas.tsx
import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './DrawingCanvas.module.css';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import DynamicReactSketchCanvas from './DynamicReactSketchCanvas'; // 래퍼 컴포넌트 임포트

// 브러시 타입 정의
type BrushType = 'pen' | 'highlighter' | 'eraser';
type BrushType = 'pen' | 'highlighter' | 'eraser';

interface DrawingCanvasProps {
    backgroundImage: string;       // 배경(캡처) 이미지 (URL, base64, data:image/... 상관없음)
    captureId?: string;           // 수정할 캡처 ID
    backgroundImage: string;       // 배경(캡처) 이미지 (URL, base64, data:image/... 상관없음)
    captureId?: string;           // 수정할 캡처 ID
    onSave: (editedImageUrl: string, captureId?: string) => void;
    onClose: () => void;
    onRefetch?: () => void;
}

export default function DrawingCanvas({ 
    backgroundImage, 
    captureId,
    onSave, 
    onClose,
    onRefetch
}: DrawingCanvasProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);

    // 드로잉(펜/형광펜/지우개) 관련 상태

    // 드로잉(펜/형광펜/지우개) 관련 상태
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [brushType, setBrushType] = useState<BrushType>('pen');
    const [opacity, setOpacity] = useState(1);

    // 이동/확대 관련 상태

    // 이동/확대 관련 상태
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isMovingMode, setIsMovingMode] = useState(false);

    // 캔버스 크기
    // 캔버스 크기
    const canvasWidth = 1280;
    const canvasHeight = 720;

    // 브러시 두께 프리셋
    const widthPresets = [
        { width: 2, icon: '•' },
        { width: 5, icon: '⚪' },
        { width: 10, icon: '⭕' },
    ];

    // 색상 프리셋
    const colorPresets = [
        { color: '#000000', name: '검정' },
        { color: '#FFFFFF', name: '하양' },
        { color: '#4A90E2', name: '파랑' },
        { color: '#7ED321', name: '초록' },
        { color: '#FF5252', name: '빨강' },
        { color: '#FFC107', name: '노랑' },
    ];

    // 브러시 종류 (펜, 형광펜, 지우개)
    const brushPresets = [
        { type: 'pen', name: '펜', icon: '✏️', width: 3 },
        { type: 'highlighter', name: '형광펜', icon: '🖍️', width: 15 },
        { type: 'eraser', name: '지우개', icon: '🧽', width: 20 },
    ];

    // 현재 브러시 색상 얻기
    const getStrokeColor = () => {
        if (brushType === 'eraser') {
            return 'transparent';
        }
        if (brushType === 'highlighter') {
            // RGBA 변환 (opacity 반영)
            const r = parseInt(strokeColor.slice(1, 3), 16);
            const g = parseInt(strokeColor.slice(3, 5), 16);
            const b = parseInt(strokeColor.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
        return strokeColor;
    };

    // 브러시 프리셋 적용
    const handleBrushChange = (preset: (typeof brushPresets)[0]) => {
        setBrushType(preset.type as BrushType);
        setStrokeWidth(preset.width);

        if (preset.type === 'eraser') {
            // 지우개 모드
            canvasRef.current?.eraseMode(true);
            setStrokeColor('transparent');
        } else {
            // 펜/형광펜
            canvasRef.current?.eraseMode(false);
            setStrokeColor('#000000');
            setOpacity(preset.type === 'highlighter' ? 0.5 : 1);
        }
    };

    /**
     * [핵심] 저장하기
     *  - exportImage('png') 시, "배경이미지+드로잉"이 통합된 PNG(Base64)가 반환됨
     */
    const handleSave = async () => {
        if (!canvasRef.current) return;
        try {
            // 1) "배경 + 선" 합쳐진 이미지 → data:image/png;base64,xxx
            const drawingDataUrl = await canvasRef.current.exportImage('png');
            if (!drawingDataUrl) {
                throw new Error('No image data from canvasRef');
            }

            // 2) data:image/png;base64, 접두어 제거 후 순수 Base64로
            let processedImage = drawingDataUrl;
            if (!processedImage.startsWith('data:image/')) {
                processedImage = `data:image/png;base64,${processedImage}`;
            }
            const base64Match = processedImage.match(/base64,(.+)/);
            if (base64Match && base64Match[1]) {
                processedImage = base64Match[1];
            }

            // 3) 서버에 PUT (updateCapture)
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다. 다시 로그인해주세요.');
                return;
            }

            const res = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/captures/${captureId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: Number(captureId),
                        image: processedImage, 
                    }),
                }
            );

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Failed to update capture: ${res.status} ${errorText}`);
            }

            // 4) 응답 (S3 URL? Base64?) 받으면, <img> src에 반영
            const data = await res.json();
            const newImage = data.image || processedImage; 
            console.log('[DrawingCanvas] update capture => ', newImage);

            // 5) UI 업데이트 (메모 Item 내 이미지 엘리먼트)
            const imgElem = document.getElementById(`capture-${captureId}`) as HTMLImageElement;
            if (imgElem && newImage) {
                // S3 주소면 그대로
                if (newImage.startsWith('http')) {
                    imgElem.src = newImage;
                } else {
                    // base64면 다시 data:image 붙이기
                    imgElem.src = `data:image/png;base64,${newImage}`;
                }
            }

            // 닫기
            onClose();
            onRefetch?.();
        } catch (err) {
            console.error('[DrawingCanvas] Save error:', err);
            alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
        onClose();
    };

    /**
     * 확대/축소
     */
    const handleZoom = (type: 'in' | 'out') => {
        setScale(prev => {
            const newScale = type === 'in' ? prev * 1.2 : prev / 1.2;
            return Math.min(Math.max(newScale, 0.5), 3);
        });
    };

    /**
     * 이동(드래그)
     */
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

    /**
     * 스페이스바로 이동 모드 on/off
     */
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

    /**
     * ESC로 모달 닫기
     */
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    /**
     * 배경 이미지 전처리
     *  - data:image/... 로 시작하면 그대로
     *  - 순수 base64이면 접두어 붙이기
     *  - http://...이면 그대로
     */
    const processedBackgroundImage = useCallback(() => {
        if (!backgroundImage) return '';
        
        if (backgroundImage.startsWith('data:image/')) {
            return backgroundImage;
        }
        if (backgroundImage.match(/^[A-Za-z0-9+/=]+$/)) {
            return `data:image/png;base64,${backgroundImage}`;
        }
        return backgroundImage;
    }, [backgroundImage]);

    // ---------------- UI ----------------
    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.drawingCanvasContainer}>

                    {/* 툴바 */}
                    <div className={styles.toolbar}>
                        {/* 브러시 두께 */}
                        <div className={styles.widthPresets}>
                            {widthPresets.map((preset, index) => (
                                <button
                                    key={index}
                                    onClick={() => setStrokeWidth(preset.width)}
                                    className={`${styles.presetButton} ${
                                        strokeWidth === preset.width ? styles.active : ''
                                    }`}
                                >
                                    {preset.icon}
                                </button>
                            ))}
                        </div>

                        {/* 색상 */}
                        <div className={styles.colorPresets}>
                            {colorPresets.map((preset, index) => (
                                <button
                                    key={index}
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

                        {/* 브러시 유형 */}
                        <div className={styles.brushPresets}>
                            {brushPresets.map((preset) => (
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

                        {/* 형광펜 투명도 */}
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

                        {/* 확대/축소 */}
                        <div className={styles.zoomControls}>
                            <button onClick={() => handleZoom('in')}>🔍+</button>
                            <button onClick={() => handleZoom('out')}>🔍-</button>
                            <span>{Math.round(scale * 100)}%</span>
                            <div className={styles.moveInfo}>스페이스+드래그=이동</div>
                        </div>
                    </div>

                    {/* 실제 Canvas 영역 - 중복된 첫 번째 canvasWrapper 제거 */}
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
                                exportWithBackgroundImage={true}
                                strokeWidth={strokeWidth}
                                strokeColor={getStrokeColor()}
                                backgroundImage={processedBackgroundImage()}
                                canvasColor="transparent"
                            />
                        </div>
                    </div>

                    {/* 액션 버튼 */}
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