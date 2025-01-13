// !!수정: crossOrigin 적용, backgroundImage URL인 경우에도 통합 이미지 생성 등
// !!수정: drawImage 시 꽉 차게 그리도록 수정
// !!수정: 저장 후 onRefetch() + window.location.reload()로 재랜더링 유도

import React, { useRef, useState, useEffect, useCallback } from 'react';
import styles from './DrawingCanvas.module.css';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import DynamicReactSketchCanvas from './DynamicReactSketchCanvas'; // 래퍼 컴포넌트 임포트

// 브러시 타입 정의
type BrushType = 'pen' | 'highlighter' | 'eraser';

interface DrawingCanvasProps {
    backgroundImage: string; // 배경(캡처) 이미지 (URL, base64, data:image/... 상관없음)
    captureId?: string; // 수정할 캡처 ID
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

    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(3);
    const [brushType, setBrushType] = useState<BrushType>('pen');
    const [opacity, setOpacity] = useState(1);

    // 이동/확대 관련 상태
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [isMovingMode, setIsMovingMode] = useState(false);

    const canvasWidth = 1280;
    const canvasHeight = 720;

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

    const handleSave = async () => {
        if (!canvasRef.current) return;
        try {
            console.log('[DrawingCanvas] Save Start', {
                captureId,
                hasBackgroundImage: !!backgroundImage,
                backgroundImageType: typeof backgroundImage,
                backgroundImageStart: backgroundImage?.substring(0, 50) + '...',
            });

            const drawingDataUrl = await canvasRef.current.exportImage('png');
            console.log('[DrawingCanvas] Drawing Data', {
                hasDrawingData: !!drawingDataUrl,
                drawingDataType: typeof drawingDataUrl,
                drawingDataStart: drawingDataUrl?.substring(0, 50) + '...',
            });

            if (!drawingDataUrl) {
                throw new Error('No image data from canvasRef');
            }

            // !!수정: 어떤 형태든 (URL/base64) 배경 이미지를 합성하도록 변경
            let processedImage = drawingDataUrl;
            const shouldMerge = !!backgroundImage; // 배경이 있다면 항상 합성 로직 수행

            if (shouldMerge) {
                console.log('[DrawingCanvas] Merging with background');
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const backgroundImg = new Image();
                const drawingImg = new Image();

                // !!수정: CORS 방지 및 S3 이미지 로딩 가능하도록
                backgroundImg.crossOrigin = 'anonymous'; 
                drawingImg.crossOrigin = 'anonymous';

                await new Promise((resolve, reject) => {
                    backgroundImg.onload = () => {
                        console.log('[DrawingCanvas] Background loaded', {
                            width: backgroundImg.width,
                            height: backgroundImg.height,
                        });
                        canvas.width = backgroundImg.width;
                        canvas.height = backgroundImg.height;
                        
                        ctx?.drawImage(backgroundImg, 0, 0, backgroundImg.width, backgroundImg.height);

                        drawingImg.onload = () => {
                            console.log('[DrawingCanvas] Drawing loaded', {
                                width: drawingImg.width,
                                height: drawingImg.height,
                            });
                            // !!수정: 꽉 차게 그리도록 (배경 크기에 맞춰서)
                            ctx?.drawImage(drawingImg, 0, 0, backgroundImg.width, backgroundImg.height);
                            resolve(null);
                        };
                        drawingImg.onerror = (e) => {
                            console.error('[DrawingCanvas] Drawing load error:', e);
                            reject(e);
                        };
                        drawingImg.src = drawingDataUrl;
                    };
                    backgroundImg.onerror = (e) => {
                        console.error('[DrawingCanvas] Background load error:', e);
                        reject(e);
                    };
                    const processedBg = processedBackgroundImage();
                    console.log('[DrawingCanvas] Processed background', {
                        processedBgType: typeof processedBg,
                        processedBgStart: processedBg.substring(0, 50) + '...',
                    });
                    backgroundImg.src = processedBg;
                });

                processedImage = canvas.toDataURL('image/png');
                console.log('[DrawingCanvas] Merged image created', {
                    processedImageType: typeof processedImage,
                    processedImageStart: processedImage.substring(0, 50) + '...',
                });
            }

            if (!processedImage.startsWith('data:image/')) {
                processedImage = `data:image/png;base64,${processedImage}`;
            }
            const base64Match = processedImage.match(/base64,(.+)/);
            if (base64Match && base64Match[1]) {
                processedImage = base64Match[1];
            }

            console.log('[DrawingCanvas] Final processed image', {
                processedImageType: typeof processedImage,
                processedImageLength: processedImage.length,
                processedImageStart: processedImage.substring(0, 50) + '...',
            });

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('토큰이 없습니다. 다시 로그인해주세요.');
            }

            console.log('[DrawingCanvas] Sending to server', {
                captureId,
                endpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/captures/${captureId}`,
            });

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
                console.error('[DrawingCanvas] Server error response:', errorText);
                throw new Error(`Failed to update capture: ${res.status} ${errorText}`);
            }

            const data = await res.json();
            console.log('[DrawingCanvas] Server response', {
                hasImage: !!data.image,
                responseDataType: typeof data.image,
                responseDataStart: data.image?.substring(0, 50) + '...',
            });
            
            const imgElem = document.getElementById(`capture-${captureId}`) as HTMLImageElement;
            if (imgElem) {
                const newImage = data.image || processedImage;
                const finalSrc = newImage.startsWith('http') 
                    ? newImage 
                    : `data:image/png;base64,${newImage}`;
                console.log('[DrawingCanvas] Updating image element', {
                    elementId: `capture-${captureId}`,
                    finalSrcType: typeof finalSrc,
                    finalSrcStart: finalSrc.substring(0, 50) + '...',
                });
                imgElem.src = finalSrc;
            }

            onClose();
            if (onRefetch) {
                await onRefetch();
                // !!수정: 저장 후 페이지 재랜더링
                window.location.reload();
            }

        } catch (err) {
            console.error('[DrawingCanvas] Save error:', err);
            alert('저장 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleZoom = (type: 'in' | 'out') => {
        setScale(prev => {
            const newScale = type === 'in' ? prev * 1.2 : prev / 1.2;
            return Math.min(Math.max(newScale, 0.5), 3);
        });
    };

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

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const processedBackgroundImage = useCallback(() => {
        console.log('[DrawingCanvas] Processing background image:', {
            originalImage: backgroundImage?.substring(0, 100),
            type: typeof backgroundImage,
            isDataUrl: backgroundImage?.startsWith('data:image/'),
            isHttpUrl: backgroundImage?.startsWith('http'),
        });

        if (!backgroundImage) return '';

        if (backgroundImage.startsWith('data:image/')) {
            return backgroundImage;
        }

        if (backgroundImage.startsWith('http://') || backgroundImage.startsWith('https://')) {
            return backgroundImage;
        }

        const result = `data:image/png;base64,${backgroundImage}`;
        console.log('[DrawingCanvas] Processed background result:', result.substring(0, 100));
        return result;
    }, [backgroundImage]);

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.drawingCanvasContainer}>
                    <div className={styles.toolbar}>
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
                            {console.log('[DrawingCanvas] Rendering canvas with props:', {
                                width: `${canvasWidth}px`,
                                height: `${canvasHeight}px`,
                                exportWithBackgroundImage: true,
                                backgroundImage: processedBackgroundImage()?.substring(0, 100),
                                hasBackgroundImage: !!backgroundImage,
                            })}
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