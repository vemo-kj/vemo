import React, { useState, useRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import styles from './editor.module.css';

interface DraftEditorProps {
    getTimestamp: () => string;
}

const DraftEditor: React.FC<DraftEditorProps> = ({ getTimestamp }) => {
    const [sections, setSections] = useState<{ timestamp: string; content: string }[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    // Editor에 포커스를 주기 위한 ref
    const editorRef = useRef<Editor | null>(null);

    // EditorState 변경 핸들러
    const handleEditorChange = (state: EditorState) => {
        setEditorState(state);
    };

    // 메모 저장
    const handleSave = () => {
        const content = editorState.getCurrentContent().getPlainText();
        if (content.trim()) {
            const newSection = {
                timestamp: getTimestamp(),
                content,
            };
            setSections([newSection, ...sections]);
            setEditorState(EditorState.createEmpty());
        }
    };

    // 인라인 스타일 활성화 여부 체크
    const isStyleActive = (style: string): boolean => {
        const currentStyle = editorState.getCurrentInlineStyle();
        return currentStyle.has(style);
    };

    // 인라인 스타일 토글
    const toggleInlineStyle = (style: string) => {
        const newState = RichUtils.toggleInlineStyle(editorState, style);
        setEditorState(newState);
        // 스타일 토글 후 다시 에디터에 포커스
        editorRef.current?.focus();
    };

    return (
        <div className={styles.container}>
            {/* 저장된 섹션(메모) 목록 */}
            <div className={styles.displayArea}>
                {sections.map((section, idx) => (
                    <div key={idx} className={styles.displayItem}>
                        <span className={styles.timestamp}>{section.timestamp}</span>
                        <span className={styles.content}>{section.content}</span>
                    </div>
                ))}
            </div>

            {/* Draft.js 에디터 영역 */}
            <div className={styles.editorArea}>
                <Editor
                    ref={editorRef}
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="내용을 입력하세요..."
                    keyBindingFn={e => {
                        if (e.key === 'Enter') return 'submit';
                        return undefined;
                    }}
                    handleKeyCommand={command => {
                        if (command === 'submit') {
                            handleSave();
                            return 'handled';
                        }
                        return 'not-handled';
                    }}
                />

                {/* 툴바 버튼 */}
                <div className={styles.toolbar}>
                    <button
                        className={isStyleActive('BOLD') ? styles.activeButton : ''}
                        // onClick 대신 onMouseDown + e.preventDefault()
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

                    <button
                        className={isStyleActive('CODE') ? styles.activeButton : ''}
                        onMouseDown={e => {
                            e.preventDefault();
                            toggleInlineStyle('CODE');
                        }}
                    >
                        {`< >`}
                    </button>

                    {/* 메모 저장 버튼 */}
                    <button className={styles.addButton} onClick={handleSave}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DraftEditor;
