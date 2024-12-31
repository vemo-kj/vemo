import React, { useState, useRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css'; // Draft.js 기본 스타일 불러오기
import styles from './editor/editor.module.css'

interface Section {
    timestamp: string;
    content: string;
    // [추가] 캡처 이미지를 저장할 수 있는 필드
    screenshot?: string;
}

interface DraftEditorProps {
    getTimestamp: () => string;
    onTimestampClick?: (timestamp: string) => void;
    // [추가] page.tsx에서 캡처한 이미지를 받을 수 있도록 props 추가
    capturedImage?: string | null;
}

function parseTimeToSeconds(timestamp: string): number {
    const [mm, ss] = timestamp.split(':').map(Number);
    const min = mm || 0;
    const sec = ss || 0;
    return min * 60 + sec;
}

export default function DraftEditor({
    getTimestamp,
    onTimestampClick,
    capturedImage,
}: DraftEditorProps) {
    const [sections, setSections] = useState<Section[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [lastSavedContent, setLastSavedContent] = useState<string | null>(null);

    // 첫 번째 입력 여부
    const [isFirstInputRecorded, setIsFirstInputRecorded] = useState(false);
    // 첫 입력 시점을 저장할 State
    const [firstInputTimestamp, setFirstInputTimestamp] = useState<string | null>(null);

    const editorRef = useRef<Editor | null>(null);

    // ====================== 메모 저장 로직 ===================== //
    const handleSave = () => {
        const text = editorState.getCurrentContent().getPlainText().trim();
        if (text.length === 0) return; // 내용이 비어있으면 저장하지 않음

        const timestamp =
            isFirstInputRecorded && firstInputTimestamp ? firstInputTimestamp : getTimestamp();

        setSections(prev => {
            const newSections = [
                ...prev,
                {
                    timestamp,
                    content: text,
                    // [중요] 캡처된 이미지를 메모에 저장하고 싶으면 여기에 추가 가능
                    // screenshot: capturedImage,
                },
            ];
            // 타임스탬프 기준 정렬
            return newSections.sort(
                (a, b) => parseTimeToSeconds(a.timestamp) - parseTimeToSeconds(b.timestamp),
            );
        });

        // 에디터 초기화
        setEditorState(EditorState.createEmpty());
        setLastSavedContent(text);

        // 첫 입력 관련 상태 초기화
        setIsFirstInputRecorded(false);
        setFirstInputTimestamp(null);
    };

    // [추가] "캡처 이미지를 바로 메모에 저장" 기능 (버튼을 누르거나 page.tsx에서 호출 가능)
    const handleSaveCapture = () => {
        if (!capturedImage) return;
        // 이때도 타임스탬프 필요
        const timestamp = getTimestamp();
        setSections(prev => {
            const newSections = [
                ...prev,
                {
                    timestamp,
                    content: '[캡처 화면]',
                    screenshot: capturedImage,
                },
            ];
            return newSections.sort(
                (a, b) => parseTimeToSeconds(a.timestamp) - parseTimeToSeconds(b.timestamp),
            );
        });
    };

    // 엔터 키 동작 처리
    const handleKeyCommand = (command: string) => {
        if (command === 'submit') {
            const currentContent = editorState.getCurrentContent().getPlainText().trim();
            if (currentContent !== lastSavedContent) {
                handleSave();
            } else if (lastSavedContent) {
                // 동일 내용 중복 저장 로직(옵션)
                setSections(prev => {
                    const newSections = [
                        ...prev,
                        {
                            timestamp: getTimestamp(),
                            content: lastSavedContent,
                        },
                    ];
                    return newSections.sort(
                        (a, b) => parseTimeToSeconds(a.timestamp) - parseTimeToSeconds(b.timestamp),
                    );
                });
            }
            return 'handled';
        }
        return 'not-handled';
    };

    // 에디터 상태 업데이트
    const handleEditorChange = (newState: EditorState) => {
        setEditorState(newState);
        const currentText = newState.getCurrentContent().getPlainText().trim();

        if (currentText.length > 0 && !isFirstInputRecorded) {
            setIsFirstInputRecorded(true);
            setFirstInputTimestamp(getTimestamp());
        }
    };

    // 스타일 활성화 상태 확인
    const isStyleActive = (style: string) => {
        return editorState.getCurrentInlineStyle().has(style);
    };

    // 스타일 토글
    const toggleInlineStyle = (style: string) => {
        setEditorState(prevState => RichUtils.toggleInlineStyle(prevState, style));
    };

    // ====================== 메모 삭제/수정 ===================== //
    const handleDelete = (index: number) => {
        setSections(prev => {
            const newSections = [...prev];
            newSections.splice(index, 1);
            return newSections;
        });
    };

    const handleEdit = (index: number) => {
        // 간단하게 prompt 예시
        const newContent = prompt('수정할 내용을 입력하세요', sections[index].content);
        if (newContent == null) return; // 취소 시 아무 것도 안 함

        setSections(prev => {
            const newSections = [...prev];
            newSections[index].content = newContent;
            return newSections;
        });
    };

    return (
        <div className={styles.container}>
            {/* [추가] 캡처 이미지 저장 버튼 (옵션)
                만약 "캡처 후 자동 저장"을 원하면, page.tsx에서 capturedImage가 갱신될 때 자동으로 handleSaveCapture() 호출해도 됨
             */}
            {capturedImage && (
                <button
                    onClick={handleSaveCapture}
                    style={{ marginBottom: '10px', cursor: 'pointer' }}
                >
                    이 캡처 이미지를 메모로 저장하기
                </button>
            )}

            {/* 메모 목록 */}
            <div className={styles.displayArea}>
                {sections.map((section, idx) => (
                    <div key={idx} className={styles.displayItem}>
                        <button
                            className={styles.timestampBtn}
                            onClick={() => onTimestampClick?.(section.timestamp)}
                        >
                            {section.timestamp}
                        </button>
                        <span className={styles.timestamp}>{section.content}</span>

                        {/* [추가] 만약 section에 screenshot이 있다면 표시 */}
                        {section.screenshot && (
                            <img
                                src={section.screenshot}
                                alt="screenshot"
                                style={{
                                    maxWidth: '100%',
                                    marginTop: '5px',
                                    border: '1px solid #ddd',
                                }}
                            />
                        )}

                        {/* [추가] 수정/삭제 버튼 */}
                        <button onClick={() => handleEdit(idx)}>수정</button>
                        <button onClick={() => handleDelete(idx)}>삭제</button>
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
                        if (e.key === 'Enter') return 'submit'; // 커스텀 명령어 "submit"
                        return null;
                    }}
                    handleKeyCommand={handleKeyCommand}
                />
                <div className={styles.toolbar}>
                    {/* 인라인 스타일 버튼 */}
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
                    {/* 저장 버튼 */}
                    <button className={styles.addButton} onClick={handleSave}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
}
