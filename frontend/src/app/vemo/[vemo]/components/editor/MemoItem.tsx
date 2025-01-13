import { debounce } from 'lodash';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import DrawingCanvas from '../DrawingCanvas/DrawingCanvas';
import ExtractButton from '../extractButton/ExtractButton';
import styles from './editor.module.css';
import DOMPurify from 'dompurify';
import DOMPurify from 'dompurify';

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
  onDrawingStart?: (captureId: string) => void;
}

// (수정) "URL / dataURL / base64"를 구분해서 최종 src를 만드는 헬퍼 함수
function getImageSrc(screenshot?: string) {
  if (!screenshot) return '';

  // 1) 이미 data:image/... 형태면 그대로
  if (screenshot.startsWith('data:image/')) {
    return screenshot;
  }

  // 2) http:// 또는 https:// 로 시작하면 외부 URL로 간주
  if (screenshot.startsWith('http://') || screenshot.startsWith('https://')) {
    return screenshot;
  }

  // 3) 나머지는 순수 base64 → 접두어 붙이기
  return `data:image/png;base64,${screenshot}`;
}

const MemoItem = memo((props: MemoItemProps) => {
  const {
    id,
    timestamp,
    htmlContent,
    screenshot,
    onTimestampClick,
    onChangeHTML,
    onDelete,
    onPauseVideo,
    isEditable,
    addTextToEditor,
    onDrawingStart
  } = props;

  // ====== (1) 그리기 영역 ======
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);

  const handleOpenDrawing = () => {
    if (onDrawingStart && id.startsWith('capture-')) {
      const captureId = id.split('-')[1];
      // 굳이 여기서 imageData를 만들 필요 없긴 하지만,
      // 만약 onDrawingStart에 넘기려면 getImageSrc(screenshot)로 변환
      if (screenshot) {
        const imageData = getImageSrc(screenshot);
        onDrawingStart(captureId);
      }
    }
  };

  const handleCloseDrawing = () => {
    setIsDrawingOpen(false);
  };

  // ====== (2) 텍스트 편집 ======
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (contentRef.current && !isEditing) {
      contentRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent, isEditing]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!isComposing) {
      const newContent = e.currentTarget.innerHTML;
      // 필요하면 debouncedOnChangeHTML(newContent);
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);
  };

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

  const debouncedOnChangeHTML = useCallback(
    debounce((newValue: string) => {
      onChangeHTML(newValue);
    }, 300),
    [onChangeHTML],
  );

  const handleTimestampClick = () => {
    onTimestampClick?.(timestamp);
  };

  // ====== (3) 이미지 로딩 상태 ======
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error('이미지 로드 실패:', { id, url: screenshot });
    setImageLoading(false);
    setImageError(true);
  };

  // (수정) useEffect에서 getImageSrc() 사용
  useEffect(() => {
    if (screenshot) {
      setImageLoading(true);
      const img = new Image();
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      img.src = getImageSrc(screenshot); // data:image/... 또는 URL
    }
  }, [screenshot, id]);

  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current) {
      console.log('이미지 엘리먼트 상태:', {
        id,
        element: imgRef.current,
        displayStyle: window.getComputedStyle(imgRef.current).display,
        dimensions: {
          width: imgRef.current.offsetWidth,
          height: imgRef.current.offsetHeight,
        },
      });
    }
  }, [id]);

  const handleSaveDrawing = async (editedImageData: string) => {
    setIsDrawingOpen(false);
  };

  // isValidImageUrl도 아래처럼 수정할 수 있음 (URL + dataURL 체크)
  const isValidImageUrl = (url: string) => {
    if (!url) return false;
    if (url.startsWith('data:image/')) return true;
    if (url.startsWith('http://') || url.startsWith('https://')) return true;
    return false;
  };

  return (
    <div className={styles.memoItemContainer}>
      <div className={styles.memoHeader}>
        <button className={styles.timestampBtn} onClick={handleTimestampClick}>
          {timestamp}
        </button>
      </div>

                {/* 2) 중앙 영역: 이미지 or HTML */}
                {/* contentEditable 영역 (노션처럼 인라인 수정) */}
                {screenshot ? (
                    <div className={styles.imageContainer}>
                        {imageLoading && <div className={styles.loadingIndicator}>로딩중...</div>}
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
                        <div className={styles.captureImageWrapper}>
                            <img
                                ref={imgRef}
                                id={`capture-${id}`}
                                src={screenshot}
                                alt="capture"
                                className={styles.captureImage}
                                onLoad={() => {
                                    setImageLoading(false);
                                    setImageError(false);
                                }}
                                onError={() => {
                                    console.error('이미지 로드 실패:', { id, url: screenshot });
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
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(htmlContent, {
                                ALLOWED_TAGS: ['p', 'strong', 'em', 'u'],
                                ALLOWED_ATTR: []
                            })
                        }}
                    />
                )}

                {/* 3) 하단에 그리기, 삭제 버튼 */}
                <div className={styles.memoFooter}>
                    {screenshot && (
                        <>
                            <button className={styles.drawBtn} onClick={handleOpenDrawing}>
                                그리기
                            </button>
                            <ExtractButton
                                imageUrl={screenshot}
                                onExtracted={text => {
                                    if (addTextToEditor) {
                                        console.log('Adding text to editor input:', text);
                                        addTextToEditor(text);
                                    }
                                }}
                                onDelete={onDelete}
                            />
                        </>
                    )}
                    <button className={styles.deleteBtn} onClick={onDelete}>
                        삭제
                    </button>
                </div>

      {isDrawingOpen && screenshot && (
        <DrawingCanvas
          captureId={id.split('-')[1]}
          onSave={handleSaveDrawing}
          onClose={handleCloseDrawing}
          backgroundImage={getImageSrc(screenshot)}
        />
      )}
    </div>
  );
});

MemoItem.displayName = 'MemoItem';

export default MemoItem;