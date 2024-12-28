import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import styles from './editor.module.css';

interface DraftEditorProps {
    getTimestamp: () => string;
    onTimestampClick?: (timestamp: string) => void;
}

// SectionItem에 'image' 타입 추가
type SectionItem = {
    timestamp: string;
    content: string;
    type: 'text' | 'image';
};

function DraftEditor({ getTimestamp, onTimestampClick }: DraftEditorProps, ref: React.Ref<any>) {
    const [sections, setSections] = useState<SectionItem[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    // (1) 텍스트 저장
    const handleSaveText = () => {
        const text = editorState.getCurrentContent().getPlainText().trim();
        if (!text) return;
        setSections(prev => [
            {
                timestamp: getTimestamp(),
                content: text,
                type: 'text',
            },
            ...prev,
        ]);
        setEditorState(EditorState.createEmpty());
    };

    // (2) 이미지 저장
    const handleSaveImage = (dataUrl: string) => {
        // timestamp와 함께 'image' 섹션을 추가
        setSections(prev => [
            {
                timestamp: getTimestamp(),
                content: dataUrl,
                type: 'image',
            },
            ...prev,
        ]);
    };

    // Draft.js 편집기 변경 핸들러
    const handleEditorChange = (newState: EditorState) => {
        setEditorState(newState);
    };

    // (3) 부모에서 호출할 수 있도록 ref에 함수 등록
    // useImperativeHandle(부모에서 넘겨준 ref, () => 노출할 메서드)
    useImperativeHandle(ref, () => ({
        addImageSection: (dataUrl: string) => {
            handleSaveImage(dataUrl);
        },
    }));

    return (
        <div className={styles.container}>
            {/* 저장된 섹션(텍스트 + 이미지) 리스트 */}
            <div className={styles.displayArea}>
                {sections.map((section, idx) => (
                    <div key={idx} className={styles.displayItem}>
                        {/* 타임스탬프 버튼: 클릭 시 영상 이동 */}
                        <button
                            className={styles.timestampBtn}
                            onClick={() => onTimestampClick?.(section.timestamp)}
                        >
                            {section.timestamp}
                        </button>

                        {section.type === 'text' && (
                            <span className={styles.content}>{section.content}</span>
                        )}

                        {section.type === 'image' && (
                            <img
                                src={section.content}
                                alt="캡처 이미지"
                                style={{ width: '100%', maxWidth: '300px' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Draft.js 에디터 영역 */}
            <div className={styles.editorArea}>
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="내용을 입력하세요..."
                />
                <div className={styles.toolbar}>
                    <button onClick={handleSaveText}>텍스트 저장</button>
                </div>
            </div>
        </div>
    );
}

// forwardRef를 사용해, 부모에서 ref로 내부 메서드를 호출 가능
export default forwardRef(DraftEditor);
