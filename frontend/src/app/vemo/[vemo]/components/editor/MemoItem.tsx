import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import styles from './editor.module.css';
import DrawingCanvas from '../DrawingCanvas/DrawingCanvas';
import { debounce } from 'lodash';

/**
 * ----------------------------------------------------------------
 * 📌 MemoItemProps
 * - 하나의 메모 아이템 정보를 보여주고, 편집/삭제 기능 제공
 * ----------------------------------------------------------------
 */
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
}

/**
 * ----------------------------------------------------------------
 * 📌 MemoItem
 * - 개별 메모(섹션) 단위로 HTML 내용 & 스크린샷(있을 경우) 렌더링
 * - 그리기 모달(DrawingCanvas) 열어서 스크린샷 위에 마킹 가능
 * ----------------------------------------------------------------
 */
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
  // DrawingCanvas 모달 열림/닫힘
  const [isDrawingOpen, setIsDrawingOpen] = useState(false);

  // 그림 그리기 모달 열기
  const handleOpenDrawing = () => {
    onPauseVideo?.(); // 영상 일시정지(옵션)
    setIsDrawingOpen(true);
  };

  // 그림 그리기 모달 닫기
  const handleCloseDrawing = () => {
    setIsDrawingOpen(false);
  };

  /**
   * ----------------------------------------------------------------
   * (1) DrawingCanvas에서 그림을 저장할 때
   * - 기존 이미지 태그의 src를 덮어씌움
   * ----------------------------------------------------------------
   */
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

  // ---------------------------------------------------------------
  // 텍스트 편집 로직
  // ---------------------------------------------------------------
  const contentRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isComposing, setIsComposing] = useState(false);

  /**
   * (2) 초기 렌더링 시 또는 props 변경 시
   * - contentEditable에 htmlContent 주입
   */
  useEffect(() => {
    if (contentRef.current && !isEditing) {
      contentRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent, isEditing]);

  /**
   * (3) onInput
   * - 한글 입력 시 composition이 완전히 끝난 후에만 onChangeHTML 호출
   */
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (!isComposing) {
      const newContent = e.currentTarget.innerHTML;
      const isEmpty = !newContent || 
                     newContent.trim() === '' || 
                     newContent === '<br>' || 
                     newContent === '<div><br></div>';
                     
      if (isEmpty) {
        e.currentTarget.innerHTML = '<br>';
      }
      // 실시간 반영이 필요한 경우에만:
      // debouncedOnChangeHTML(newContent);
    }
  };

  const handleCompositionStart = () => setIsComposing(true);
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

  /**
   * (5) 타임스탬프를 클릭하면 영상 해당 시점으로 이동
   */
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

    // 추출하기 버튼 클릭 핸들러 추가
    const handleExtractText = async () => {
        if (!screenshot) return;

        try {
            const response = await fetch('http://localhost:5050/text-extraction', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ imageBase64: screenshot }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || '텍스트 추출에 실패했습니다.');
            }

            // 추출된 텍스트를 HTML 컨텐츠에 추가
            const newContent = htmlContent + '<p>' + data.text + '</p>';
            onChangeHTML(newContent);

        } catch (error) {
            console.error('텍스트 추출 실패:', error);
            alert('텍스트 추출에 실패했습니다.');
        }
    };

  /**
   * ----------------------------------------------------------------
   * 📌 최종 렌더링
   * ----------------------------------------------------------------
   */
  return (
    <div className={styles.memoItemContainer}>
      {/* 헤더 영역: 타임스탬프 버튼 */}
      <div className={styles.memoHeader}>
        <button className={styles.timestampBtn} onClick={handleTimestampClick}>
          {timestamp}
        </button>
      </div>

      {/* 본문 영역: 이미지(스크린샷) 또는 텍스트(contentEditable) */}
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
          contentEditable={isEditable} // true면 사용자 편집 가능
          suppressContentEditableWarning={true}
          onFocus={() => setIsEditing(true)}
          onInput={handleInput}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          onBlur={handleBlur}
          ref={contentRef}
        />
      )}

      {/* 푸터 영역: 그리기 버튼, 추출하기, 삭제 버튼 */}
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

      {/* 그림 그리기 모달 (DrawingCanvas) */}
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