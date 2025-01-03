import React, { useImperativeHandle, forwardRef, useState } from 'react';
import { Editor as DraftEditor, EditorState, RichUtils } from 'draft-js';
import { stateToHTML } from 'draft-js-export-html';
import 'draft-js/dist/Draft.css';
import styles from './editor.module.css';
import MomoItem from './MemoItem';
import { memoService } from '../../api/memoService';

interface Section {
  id: string;
  timestamp: Date;
  htmlContent: string; // Draft.js 인라인 스타일을 포함한 HTML
  screenshot?: string;
}

interface CustomEditorProps {
  ref: React.RefObject<any>;
  getTimestamp: () => Date;
  onTimestampClick: (timestamp: Date) => void;
  isEditable?: boolean;
  editingItemId?: string | null;
  onEditStart?: (itemId: string) => void;
  onEditEnd?: () => void;
  onPauseVideo?: () => void;
}

// parseTimeToSeconds는 동일
function parseTimeToSeconds(timestamp: string): number {
  const [mm, ss] = timestamp.split(':').map(Number);
  return (mm || 0) * 60 + (ss || 0);
}

const CustomEditor = forwardRef<unknown, CustomEditorProps>((props, ref) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

  const [isFirstInputRecorded, setIsFirstInputRecorded] = useState(false);
  const [firstInputTimestamp, setFirstInputTimestamp] = useState<Date | null>(null);

  // ============ 1) addCaptureItem =============
  // 부모에서 ref로 호출
  useImperativeHandle(ref, () => ({
    addCaptureItem: (timestamp: Date, imageUrl: string) => {
      const newItem: Section = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp,
        htmlContent: '', // 텍스트 없이
        screenshot: imageUrl, // 이미지만
      };
      setSections(prev => [...prev, newItem]);
    },
  }));

  // ============ 2) handleSave (Draft -> HTML)
  const handleSave = async () => {
    const contentState = editorState.getCurrentContent();
    if (!contentState.hasText()) return;

    const html = stateToHTML(contentState);
    const stamp = isFirstInputRecorded && firstInputTimestamp 
      ? firstInputTimestamp 
      : props.getTimestamp();

    try {
      // memoService.create 호출 시 Date를 toISOString()으로 변환
      const savedMemo = await memoService.create({
        timestamp: new Date(stamp),
        htmlContent: html,
      });

      if (savedMemo) {
        const newSection: Section = {
          id: savedMemo.id.toString(),
          timestamp: new Date(stamp),
          htmlContent: html,
        };

        setSections(prev => [...prev, newSection]);
        setEditorState(EditorState.createEmpty());
        setIsFirstInputRecorded(false);
        setFirstInputTimestamp(null);
      }
    } catch (error) {
      console.error('메모 저장 실패:', error);
      alert('메모 저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // ============ 3) handleKeyCommand (엔터 => 저장)
  const handleKeyCommand = (command: string) => {
    if (command === 'submit') {
      handleSave();
      return 'handled';
    }
    return 'not-handled';
  };

  // Draft onChange
  const handleEditorChange = (newState: EditorState) => {
    setEditorState(newState);
    const t = newState.getCurrentContent().getPlainText().trim();
    if (t.length > 0 && !isFirstInputRecorded) {
      setIsFirstInputRecorded(true);
      setFirstInputTimestamp(props.getTimestamp());
    }
  };

  // 인라인 스타일
  const isStyleActive = (style: string) => editorState.getCurrentInlineStyle().has(style);

  const toggleInlineStyle = (style: string) => {
    setEditorState(prev => RichUtils.toggleInlineStyle(prev, style));
  };

  // 메모 수정/삭제
  const handleChangeItem = (id: string, newHTML: string) => {
    setSections(prev => prev.map(s => (s.id === id ? { ...s, htmlContent: newHTML } : s)));
  };
  const handleDeleteItem = (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className={styles.container}>
      {/* 메모 목록 */}
      <div className={styles.displayArea}>
        {sections.map(item => (
          <MomoItem
            key={item.id}
            id={item.id}
            timestamp={item.timestamp}
            htmlContent={item.htmlContent}
            screenshot={item.screenshot}
            onTimestampClick={props.onTimestampClick}
            onDelete={() => handleDeleteItem(item.id)}
            onChangeHTML={newVal => handleChangeItem(item.id, newVal)}
            onPauseVideo={props.onPauseVideo}
            isEditable={props.isEditable}
          />
        ))}
      </div>

      {/* Draft Editor */}
      <div className={styles.editorArea}>
        <DraftEditor
          editorState={editorState}
          onChange={handleEditorChange}
          placeholder="내용을 입력하세요..."
          keyBindingFn={e => (e.key === 'Enter' ? 'submit' : null)}
          handleKeyCommand={handleKeyCommand}
        />
        <div className={styles.toolbar}>
          {/* B I U 버튼 */}
          <button
            className={isStyleActive('BOLD') ? styles.activeButton : ''}
            onMouseDown={e => {
              e.preventDefault();
              toggleInlineStyle('BOLD');
            }}
          >
            B
          </button>
          <button
            className={isStyleActive('ITALIC') ? styles.activeButton : ''}
            onMouseDown={e => {
              e.preventDefault();
              toggleInlineStyle('ITALIC');
            }}
          >
            I
          </button>
          <button
            className={isStyleActive('UNDERLINE') ? styles.activeButton : ''}
            onMouseDown={e => {
              e.preventDefault();
              toggleInlineStyle('UNDERLINE');
            }}
          >
            U
          </button>
          <button className={styles.addButton} onClick={handleSave}>
            +
          </button>
        </div>
      </div>
    </div>
  );
});

export default CustomEditor;