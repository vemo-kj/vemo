import React, { useImperativeHandle, forwardRef, useState, useRef } from 'react';
import { Editor as DraftEditor, EditorState, RichUtils, convertToRaw, convertFromRaw } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import 'draft-js/dist/Draft.css';
import styles from './editor.module.css';
import MemoItem from './MemoItem';

interface Section {
    id: string;
    timestamp: string;
    htmlContent: string;
    screenshot?: string;
}

interface CustomEditorProps {
    getTimestamp: () => string;
    onTimestampClick: (timestamp: string) => void;
    isEditable?: boolean;
    editingItemId?: string | null;
    onEditStart?: (itemId: string) => void;
    onEditEnd?: () => void;
    onPauseVideo?: () => void;
    videoId: string;
    onMemoSaved?: () => void;
}

// ref 타입 정의
interface EditorRef {
    addCaptureItem: (timestamp: string, imageUrl: string) => void;
}

function parseTimeToSeconds(timestamp: string): number {
    const [mm, ss] = timestamp.split(':').map(Number);
    return (mm || 0) * 60 + (ss || 0);
}

const CustomEditor = forwardRef<EditorRef, Omit<CustomEditorProps, 'ref'>>((props, ref) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    useImperativeHandle(ref, () => ({
        addCaptureItem: async (timestamp: string, imageUrl: string) => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    console.error('토큰이 없습니다.');
                    return;
                }

                // 먼저 메모 생성 또는 조회
                const memosResponse = await fetch(`http://localhost:5050/home/memos/${props.videoId}`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include'
                });

                if (!memosResponse.ok) {
                    throw new Error('메모 생성에 실패했습니다.');
                }

                const memosData = await memosResponse.json();

                // 캡처 저장
                const captureResponse = await fetch(`http://localhost:5050/captures`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        timestamp,
                        image: imageUrl,
                        memosId: memosData.id  // 생성된 메모의 ID 사용
                    })
                });

                if (!captureResponse.ok) {
                    throw new Error('캡처 저장에 실패했습니다.');
                }

                const data = await captureResponse.json();
                console.log('캡처 저장 성공:', data);

                // 로컬 상태 업데이트
                const newItem: Section = {
                    id: `capture-${Date.now()}`,
                    timestamp,
                    htmlContent: '',
                    screenshot: imageUrl,
                };
                setSections(prev => [...prev, newItem]);
                props.onMemoSaved?.();

            } catch (error) {
                console.error('캡처 저장 실패:', error);
            }
        },
    }));

    const handleSave = async () => {
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) return;

        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            const html = convertToHTML(contentState);
            const timestamp = props.getTimestamp();

            const response = await fetch(`http://localhost:5050/home/memos/${props.videoId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('서버 응답:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText
                });
                throw new Error('메모 저장에 실패했습니다.');
            }

            const data = await response.json();
            console.log('메모 저장 성공:', data);

            props.onMemoSaved?.();

            const newItem: Section = {
                id: `memo-${Date.now()}`,
                timestamp,
                htmlContent: html,
            };

            setSections(prev => [...prev, newItem]);
            setEditorState(EditorState.createEmpty());

        } catch (error) {
            console.error('메모 저장 실패:', error);
        }
    };

    const handleChangeItem = (id: string, newHTML: string) => {
        const updatedSections = sections.map(item => {
            if (item.id === id) {
                return {
                    ...item,
                    htmlContent: newHTML,
                };
            }
            return item;
        });
        setSections(updatedSections);
    };

    const handleDeleteItem = (id: string) => {
        const updatedSections = sections.filter(item => item.id !== id);
        setSections(updatedSections);
    };

    // 인라인 스타일 토글 함수 추가
    const toggleInlineStyle = (style: string) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    // 현재 스타일 상태 확인 함수 추가
    const isStyleActive = (style: string) => {
        return editorState.getCurrentInlineStyle().has(style);
    };

    return (
        <div className={styles.container}>
            <div className={styles.displayArea}>
                {sections.map(item => (
                    <MemoItem
                        key={item.id}
                        id={item.id}
                        timestamp={item.timestamp}
                        htmlContent={item.htmlContent}
                        screenshot={item.screenshot}
                        onTimestampClick={props.onTimestampClick}
                        onChangeHTML={(newHTML) => handleChangeItem(item.id, newHTML)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onPauseVideo={props.onPauseVideo}
                        isEditable={props.isEditable}
                    />
                ))}
            </div>
            <div className={styles.editorArea}>
                <DraftEditor
                    editorState={editorState}
                    onChange={setEditorState}
                    placeholder="내용을 입력하세요..."
                />
                <div className={styles.toolbar}>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('BOLD') ? styles.activeButton : ''}`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleInlineStyle('BOLD');
                        }}
                    >
                        B
                    </button>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('ITALIC') ? styles.activeButton : ''}`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleInlineStyle('ITALIC');
                        }}
                    >
                        I
                    </button>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('UNDERLINE') ? styles.activeButton : ''}`}
                        onMouseDown={(e) => {
                            e.preventDefault();
                            toggleInlineStyle('UNDERLINE');
                        }}
                    >
                        U
                    </button>
                    <button onClick={handleSave} className={styles.saveButton}>
                        저장
                    </button>
                </div>
            </div>
        </div>
    );
});

CustomEditor.displayName = 'CustomEditor';

export default CustomEditor;
