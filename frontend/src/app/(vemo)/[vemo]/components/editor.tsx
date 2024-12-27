import React, { useState, useRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import styles from './editor.module.css';

interface DraftEditorProps {
    // 부모로부터
    getTimestamp: () => string;
    onTimestampClick?: (timestamp: string) => void;
}

export default function DraftEditor({ getTimestamp, onTimestampClick }: DraftEditorProps) {
    const [sections, setSections] = useState<{ timestamp: string; content: string }[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const editorRef = useRef<Editor | null>(null);

    const handleSave = () => {
        const text = editorState.getCurrentContent().getPlainText();
        if (text.trim().length > 0) {
            setSections([
                {
                    timestamp: getTimestamp(), // 부모의 현재 재생 시간
                    content: text,
                },
                ...sections,
            ]);
            setEditorState(EditorState.createEmpty());
        }
    };

    // 에디터 상태 업데이트
    const handleEditorChange = (newState: EditorState) => {
        setEditorState(newState);
    };

    // Draft.js 인라인 스타일 활성화 체크
    const isStyleActive = (style: string) => {
        return editorState.getCurrentInlineStyle().has(style);
    };

    // 인라인 스타일 토글
    const toggleInlineStyle = (style: string) => {
        const newState = RichUtils.toggleInlineStyle(editorState, style);
        setEditorState(newState);
        // 에디터 포커스 복원
        editorRef.current?.focus();
    };

    // Enter 키로 저장
    const handleKeyCommand = (command: string) => {
        if (command === 'submit') {
            handleSave();
            return 'handled';
        }
        return 'not-handled';
    };

    return (
        <div className={styles.container}>
            {/* 저장된 메모 목록 */}
            <div className={styles.displayArea}>
                {sections.map((section, idx) => (
                    <div key={idx} className={styles.displayItem}>
                        {/* 타임스탬프 버튼 (클릭 시 부모의 onTimestampClick 호출) */}
                        <button
                            className={styles.timestampBtn}
                            onClick={() => onTimestampClick?.(section.timestamp)}
                        >
                            {section.timestamp}
                        </button>
                        <span className={styles.content}>{section.content}</span>
                    </div>
                ))}
            </div>

            {/* Draft.js 에디터 */}
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
                    handleKeyCommand={handleKeyCommand}
                />
                <div className={styles.toolbar}>
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
                    <button
                        className={isStyleActive('CODE') ? styles.activeButton : ''}
                        onMouseDown={e => {
                            e.preventDefault();
                            toggleInlineStyle('CODE');
                        }}
                    >
                        {'<>'}
                    </button>
                    <button className={styles.addButton} onClick={handleSave}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}
