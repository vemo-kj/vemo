import React, { memo, useRef, useState, useEffect, ChangeEvent, FocusEvent, useCallback } from 'react';
import styles from './editor.module.css';
import DrawingCanvas from '../DrawingCanvas/DrawingCanvas';
const debounce = require('lodash/debounce');


interface MemoItemProps {
    id: string;
    timestamp: string;
    htmlContent: string;
    screenshot?: string;
    onTimestampClick?: (timestamp: string) => void;
    onChangeHTML: (newHTML: string) => void;
    onDelete: () => void;
    onPauseVideo?: () => void;
    isEditable?: boolean;
    addTextToEditor?: (text: string) => void;
}

const MemoItem = memo(({ id, timestamp, htmlContent, screenshot, onTimestampClick, onChangeHTML, onDelete, onPauseVideo, isEditable, addTextToEditor }: MemoItemProps) => {
    console.log('MemoItem 렌더링:', {
        id,
        timestamp,
        hasScreenshot: !!screenshot,
        screenshotLength: screenshot?.length
    });

    // ====== (1) 그리기 영역 ======
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);

    // 그리기 영역 열기
    const handleOpenDrawing = () => {
        onPauseVideo?.();
        setIsDrawingOpen(true);
    };

    // 그리기 영역 닫기
    const handleCloseDrawing = () => {
        setIsDrawingOpen(false);
    };

    // 그리기 저장 핸들러
    const handleSaveDrawing = (dataUrl: string) => {
        const imgElem = document.getElementById(`capture-${id}`) as HTMLImageElement;
        if (imgElem) {
            imgElem.src = dataUrl;
            imgElem.style.width = '100%';
            imgElem.style.height = '100%';
            imgElem.style.objectFit = 'cover';
        }
        setIsDrawingOpen(false);
    };

    // ====== (2) 텍스트 편집 ======
    const contentRef = useRef<HTMLDivElement>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isComposing, setIsComposing] = useState(false);

    // 초기 내용 설정
    useEffect(() => {
        if (contentRef.current && !isEditing) {
            contentRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent, isEditing]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        if (!isComposing) {
            const newContent = e.currentTarget.innerHTML;
        }
    };

    const handleCompositionStart = () => {
        setIsComposing(true);
    };

    const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
        setIsComposing(false);
    };

    // 편집 완료할 때
    const handleBlur = () => {
        setIsEditing(false);
        if (!contentRef.current) return;

        const newValue = contentRef.current.innerHTML;
        if (newValue.trim().length === 0) {
            onDelete();
        } else {
            onChangeHTML(newValue);
        }
    };

    const handleTimestampClick = () => {
        onTimestampClick?.(timestamp);
    };

    // debounce를 적용하여 잦은 상태 업데이트 방지
    const debouncedOnChangeHTML = useCallback(
        debounce((newValue: string) => {
            onChangeHTML(newValue);
        }, 300),
        [onChangeHTML]
    );

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [extractedText, setExtractedText] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);

    const handleExtractText = async () => {
        if (!screenshot) return;

        try {
            setIsExtracting(true);

            // 이미지 압축 처리
            const compressedImage = await compressImageBeforeSend(screenshot);

            const response = await fetch('http://localhost:5050/text-extraction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageBase64: compressedImage }),
            });

            const data = await response.json();
            if (data.success) {
                setExtractedText(data.text);
                setIsModalOpen(true);
            } else {
                throw new Error(data.error || '텍스트 추출에 실패했습니다.');
            }

            // 추출된 텍스트를 HTML 컨텐츠에 추가
            const newContent = htmlContent + '<p>' + data.text + '</p>';
            onChangeHTML(newContent);

        } catch (error) {
            console.error('텍스트 추출 실패:', error);
            alert('텍스트 추출에 실패했습니다.');
        } finally {
            setIsExtracting(false);
        }
    };

    // 이미지 압축 유틸리티 함수
    const compressImageBeforeSend = async (base64String: string): Promise<string> => {
        // Base64 헤더 분리
        const [header, base64Image] = base64String.split(',');

        // Canvas 생성
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        return new Promise((resolve) => {
            img.onload = () => {
                // 최대 너비/높이 설정 (예: 800px)
                const maxDimension = 800;
                let width = img.width;
                let height = img.height;

                // 비율 유지하면서 크기 조정
                if (width > height && width > maxDimension) {
                    height = (height * maxDimension) / width;
                    width = maxDimension;
                } else if (height > maxDimension) {
                    width = (width * maxDimension) / height;
                    height = maxDimension;
                }

                canvas.width = width;
                canvas.height = height;

                // 이미지 그리기
                ctx?.drawImage(img, 0, 0, width, height);

                // 압축된 Base64 생성 (품질 0.7)
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };

            // 원본 이미지 로드
            img.src = base64String;
        });
    };

    const handleUseText = () => {
        // 추출된 텍스트를 에디터에 추가
        if (addTextToEditor && extractedText) {
            addTextToEditor(extractedText);
        }
        setIsModalOpen(false);
        setExtractedText('');
    };

    const handleCancelExtract = () => {
        setIsModalOpen(false);
        setExtractedText('');
    };

    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);

    // 이미지 로딩 시작 시 호출
    useEffect(() => {
        if (screenshot) {
            console.log('이미지 로딩 시작:', {
                id,
                screenshotStart: screenshot.substring(0, 50) + '...'
            });

            setImageLoading(true);
            const img = new Image();

            img.onload = () => {
                console.log('이미지 로드 성공:', {
                    id,
                    width: img.width,
                    height: img.height
                });
                setImageLoading(false);
                setImageError(false);
            };

            img.onerror = (error) => {
                console.error('이미지 로드 실패:', {
                    id,
                    error
                });
                setImageLoading(false);
                setImageError(true);
            };

            img.src = screenshot;
        }
    }, [screenshot, id]);

    // 이미지 엘리먼트 참조 추가
    const imgRef = useRef<HTMLImageElement>(null);

    // 이미지 엘리먼트 마운트 후 확인
    useEffect(() => {
        if (imgRef.current) {
            console.log('이미지 엘리먼트 상태:', {
                id,
                element: imgRef.current,
                displayStyle: window.getComputedStyle(imgRef.current).display,
                dimensions: {
                    width: imgRef.current.offsetWidth,
                    height: imgRef.current.offsetHeight
                }
            });
        }
    }, [id]);

    return (
        <div className={styles.memoItemContainer}>
            {/* 1) 상단에 타임스탬프 */}
            <div className={styles.memoHeader}>
                <button
                    className={styles.timestampBtn}
                    onClick={() => onTimestampClick?.(timestamp)}
                >
                    {timestamp}
                </button>
            </div>

            {/* 2) 중앙 영역: 이미지 or HTML */}
            {/* contentEditable 영역 (노션처럼 인라인 수정) */}
            {screenshot ? (
                <div className={styles.imageContainer}>
                    {imageLoading && (
                        <div className={styles.loadingIndicator}>
                            로딩중...
                        </div>
                    )}
                    {imageError && (
                        <div className={styles.errorMessage}>
                            이미지를 불러올 수 없습니다
                            <button
                                onClick={() => {
                                    setImageLoading(true);
                                    setImageError(false);
                                    if (imgRef.current) {
                                        imgRef.current.src = screenshot;
                                    }
                                }}
                                className={styles.retryButton}
                            >
                                다시 시도
                            </button>
                        </div>
                    )}
                    <div
                        className={styles.captureImageWrapper}
                        style={{
                            width: '100%',
                            minHeight: '200px',
                            position: 'relative',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}
                    >
                        <img
                            ref={imgRef}
                            id={`capture-${id}`}
                            src={screenshot}
                            alt="capture"
                            className={styles.captureImage}
                            style={{
                                display: 'block',
                                width: '100%',
                                height: 'auto',
                                position: 'relative',
                                zIndex: 1
                            }}
                            onLoad={(e) => {
                                console.log('이미지 로드 완료:', {
                                    naturalWidth: (e.target as HTMLImageElement).naturalWidth,
                                    naturalHeight: (e.target as HTMLImageElement).naturalHeight
                                });
                                setImageLoading(false);
                                setImageError(false);
                            }}
                            onError={() => {
                                console.error('이미지 로드 실패:', {
                                    id,
                                    screenshotLength: screenshot.length
                                });
                                setImageLoading(false);
                                setImageError(true);
                            }}
                        />
                    </div>
                </div>
            ) : (
                <div
                    className={styles.itemContent}
                    contentEditable={isEditable}
                    suppressContentEditableWarning={true}
                    onFocus={() => setIsEditing(true)}
                    onInput={handleInput}
                    onCompositionStart={handleCompositionStart}
                    onCompositionEnd={handleCompositionEnd}
                    onBlur={handleBlur}
                    ref={contentRef}
                />
            )}

            {/* 3) 하단에 그리기, 삭제 버튼 */}
            <div className={styles.memoFooter}>
                {screenshot && (
                    <>
                        <button className={styles.drawBtn} onClick={handleOpenDrawing}>
                            그리기
                        </button>
                        <button
                            className={styles.extractBtn}
                            onClick={handleExtractText}
                            disabled={isExtracting}
                        >
                            {isExtracting ? '추출 중...' : '추출하기'}
                        </button>
                    </>
                )}
                <button className={styles.deleteBtn} onClick={onDelete}>
                    삭제
                </button>
            </div>

            {/* 4) 그리기 모달 (DrawingCanvas로 교체) */}
            {isDrawingOpen && screenshot && (
                <div className={styles.drawOverlay}>
                    <div className={styles.drawPopup}>
                        <h3>그리기</h3>
                        <DrawingCanvas
                            onSave={handleSaveDrawing}
                            onClose={handleCloseDrawing}
                            backgroundImage={screenshot} // 배경 이미지 전달
                        />
                    </div>
                </div>
            )}

            {/* 추출 결과 모달 */}
            {isModalOpen && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <h2>추출된 텍스트</h2>
                        <div className={styles.modalContent}>
                            <p>{extractedText}</p>
                        </div>
                        <div className={styles.modalActions}>
                            <button onClick={handleUseText} className={styles.useButton}>
                                사용하기
                            </button>
                            <button onClick={handleCancelExtract} className={styles.cancelButton}>
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

MemoItem.displayName = 'MemoItem';

export default MemoItem;
