import React, { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { Editor as DraftEditor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import { convertToHTML } from 'draft-convert';
// import { convertToHTML } from 'draft-js-export-html';

import { ReactSketchCanvas } from 'react-sketch-canvas';

import 'draft-js/dist/Draft.css';
import styles from './editor.module.css';
import MomoItem from './MemoItem';

interface Section {
    id: string;
    timestamp: string;
    htmlContent: string; // Draft.js 인라인 스타일을 포함한 HTML
    screenshot?: string;
}

interface CustomEditorProps {
    ref: React.RefObject<any>;
    getTimestamp: () => string;
    onTimestampClick: (timestamp: string) => void;
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

// forwardRef로 부모가 addCaptureItem을 호출 가능
const CustomEditor = React.forwardRef<unknown, CustomEditorProps>((props, ref) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    const [isFirstInputRecorded, setIsFirstInputRecorded] = useState(false);
    const [firstInputTimestamp, setFirstInputTimestamp] = useState<string | null>(null);
    const [lastSavedHTML, setLastSavedHTML] = useState<string>(''); // HTML 저장

    // ============ 1) 메모 역순 or 정순 =============
    // 이번 요구사항은 "위에서 아래로" → 즉, **새 메모가 위에**가 아니라, **아래**에 추가
    // 따라서 render할 때 그냥 map을 쓰고, 맨 앞에 추가가 아닌, 맨 뒤에 추가
    // (아래 handleSave에서 prev => [...prev, newItem])

    // ============ 2) addCaptureItem =============
    useImperativeHandle(ref, () => ({
        addCaptureItem: (timestamp: string, imageUrl: string) => {
            const newItem: Section = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp,
                htmlContent: '', // text 없이
                screenshot: imageUrl, // 이미지만
            };
            setSections(prev => [...prev, newItem]); // 아래로 붙이기
        },
    }));

    // ============ 3) handleSave (Draft -> HTML)
    const handleSave = () => {
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) return; // 비어있으면 무시

        // Draft -> HTML
        const html = convertToHTML(editorState.getCurrentContent());

        const stamp =
            isFirstInputRecorded && firstInputTimestamp ? firstInputTimestamp : props.getTimestamp();

        const newItem: Section = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: stamp,
            htmlContent: html,
        };

        setSections(prev => [...prev, newItem]); // 아래로 추가
        setEditorState(EditorState.createEmpty());
        setLastSavedHTML(html);
        setIsFirstInputRecorded(false);
        setFirstInputTimestamp(null);
    };

    // ============ 4) handleKeyCommand (엔터 => 저장)
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

    // 메모 수정(HTML), 삭제
    const handleChangeItem = (id: string, newHTML: string) => {
        setSections(prev => prev.map(s => (s.id === id ? { ...s, htmlContent: newHTML } : s)));
    };
    const handleDeleteItem = (id: string) => {
        setSections(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div className={styles.container}>
            {/* 메모 목록 (빨간 영역) */}
            <div className={styles.displayArea}>
                {/* 1) 위→아래 생성이므로, 그냥 map (인덱스 순) */}
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
                    {/* 더 필요하면 추가 */}
                    <button className={styles.addButton} onClick={handleSave}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
});

export default CustomEditor;
