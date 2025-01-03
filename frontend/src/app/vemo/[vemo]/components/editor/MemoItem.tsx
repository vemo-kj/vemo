import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import styles from './editor.module.css';
import DrawingCanvas from '../DrawingCanvas/DrawingCanvas';
import { debounce } from 'lodash';
import { memoService } from '../../api/memoService';

interface MemoItemProps {
  id: string;
  timestamp: Date;
  htmlContent: string; 
  screenshot?: string;
  onTimestampClick?: (timestamp: Date) => void;
  onChangeHTML: (newHTML: string) => void;
  onDelete: () => void;
  onPauseVideo?: () => void;
  isEditable?: boolean;
}

const MemoItem = memo(({
  id,
  timestamp,
  htmlContent,
  screenshot,
  onTimestampClick,
  onChangeHTML,
  onDelete,
  onPauseVideo,
  isEditable
}: MemoItemProps) => {
  // ====== (1) 그리기 영역 ======
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);

  const handleOpenDrawing = () => {
    onPauseVideo?.();
    setIsDrawingOpen(true);
  };
  const handleCloseDrawing = () => {
    setIsDrawingOpen(false);
  };
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
      // 여기서 바로 API 호출은 부담이므로 debounce 등으로 처리 가능
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    setIsComposing(false);
  };

  // 편집 완료할 때 (onBlur)
  const handleBlur = async () => {
    setIsEditing(false);
    if (!contentRef.current) return;
    
    const newValue = contentRef.current.innerHTML;
    if (newValue.trim().length === 0) {
      await memoService.delete(parseInt(id));
      onDelete();
    } else {
      await memoService.update({
        id: parseInt(id),
        htmlContent: newValue,
        timestamp: timestamp.toISOString() // [수정됨] timestamp도 문자열로
      });
      onChangeHTML(newValue);
    }
  };

  const debouncedOnChangeHTML = useCallback(
    debounce((newValue: string) => {
      onChangeHTML(newValue);
    }, 300),
    [onChangeHTML]
  );

  return (
    <div className={styles.memoItemContainer}>
      <div className={styles.memoHeader}>
        <button
          className={styles.timestampBtn}
          onClick={() => onTimestampClick?.(timestamp)}
        >
          {timestamp.toString()}
        </button>
      </div>

      {/* 이미지 or 텍스트 */}
      {screenshot ? (
        <img
          id={`capture-${id}`}
          src={screenshot}
          alt="capture"
          className={styles.captureImage}
        />
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

      <div className={styles.memoFooter}>
        {screenshot && (
          <button className={styles.drawBtn} onClick={handleOpenDrawing}>
            그리기
          </button>
        )}
        <button className="style export">추출하기</button>
        <button className={styles.deleteBtn} onClick={onDelete}>
          삭제
        </button>
      </div>

      {isDrawingOpen && screenshot && (
        <div className={styles.drawOverlay}>
          <div className={styles.drawPopup}>
            <h3>그리기</h3>
            <DrawingCanvas
              onSave={handleSaveDrawing}
              onClose={handleCloseDrawing}
              backgroundImage={screenshot}
            />
          </div>
        </div>
      )}
    </div>
  );
});

MemoItem.displayName = 'MemoItem';

export default MemoItem;