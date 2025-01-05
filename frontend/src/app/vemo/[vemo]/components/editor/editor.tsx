import React, { useImperativeHandle, forwardRef, useState, useEffect } from 'react';

declare global {
    interface Window {
        onYouTubeIframeAPIReady?: () => void;
    }
}
import { Editor as DraftEditor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
import { convertToHTML } from 'draft-convert';
import 'draft-js/dist/Draft.css';

import styles from './editor.module.css';
import MomoItem from './MemoItem';

// 대신 필요한 함수들만 import
import { createMemos} from '@/app/api/memoService';

/**
 * ----------------------------------------------------------------
 * 📌 Section 인터페이스
 * - 하나의 메모(노트) 섹션을 의미
 * ----------------------------------------------------------------
 */
interface Section {
    id: string;
    timestamp: string;
    htmlContent: string;
    screenshot?: string;
}

/**
 * ----------------------------------------------------------------
 * 📌 CustomEditorProps
 * - 부모 컴포넌트(VemoPage 등)로부터 전달받을 Props 정의
 * ----------------------------------------------------------------
 */
interface CustomEditorProps {
    ref?: React.RefObject<any>;
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

    // Draft.js 에디터 상태
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());

    // 첫 글자 입력 시점을 저장하기 위한 상태
    const [isFirstInputRecorded, setIsFirstInputRecorded] = useState(false);
    const [firstInputTimestamp, setFirstInputTimestamp] = useState<string | null>(null);
    const [lastSavedHTML, setLastSavedHTML] = useState<string>(''); // HTML 저장

    // ============ 1) 메모 역순 or 정순 =============
    // 이번 요구사항은 "위에서 아래로" → 즉, **새 메모가 위에**가 아니라, **아래**에 추가
    // 따라서 render할 때 그냥 map을 쓰고, 맨 앞에 추가가 아닌, 맨 뒤에 추가
    // (아래 handleSave에서 prev => [...prev, newItem])

    // ============ 2) addCaptureItem =============
    useImperativeHandle(ref, () => ({
        /**
         * 캡처 이미지를 새 메모(Section)로 추가
         */
        addCaptureItem: (timestamp: string, imageUrl: string) => {
            const newItem: Section = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp,
                htmlContent: '',
                screenshot: imageUrl,
            };
            setSections(prev => [...prev, newItem]);
        },
    }));

    /**
     * ----------------------------------------------------------------
     * (3) 메모 저장 핸들러
     * - Draft.js의 contentState → HTML 변환 후 서버로 전송
     * ----------------------------------------------------------------
     */
    const handleSave = async () => {
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) return;

        const html = convertToHTML(contentState);
        const currentTimestamp = props.getTimestamp(); // 유튜브 재생 시간

        if (!props.memosId) {
            console.warn('memosId가 없어 메모를 저장할 수 없습니다.');
            return;
        }

        try {
            console.log('Saving memo with timestamp:', currentTimestamp); // 디버깅용

            const savedMemo = await memoService.createMemo({
                timestamp: currentTimestamp, // 유튜브 재생 시간을 타임스탬프로 사용
                description: html,
                memosId: props.memosId,
            });

            // 새로 생성된 아이템을 sections에 추가
            const newItem: Section = {
                id: savedMemo.id.toString(),
                timestamp: currentTimestamp, // 화면에는 유튜브 재생 시간 표시
                htmlContent: html,
            };
            setSections(prev => [...prev, newItem]);

            // 에디터 초기화
            setEditorState(EditorState.createEmpty());
            setLastSavedHTML(html);
            setIsFirstInputRecorded(false);
            setFirstInputTimestamp(null);
        } catch (error) {
            console.error('Failed to save memo:', error);
        }
    };

    /**
     * ----------------------------------------------------------------
     * (4) 엔터 키와 백스페이스 키 입력 처리
     */
    const handleKeyCommand = (command: string) => {
        try {
            const contentState = editorState.getCurrentContent();
            const selection = editorState.getSelection();
            const startKey = selection.getStartKey();
            const startBlock = contentState.getBlockForKey(startKey);
            const isEmpty = !startBlock.getText().trim();

            // 백스페이스 처리
            if (command === 'backspace') {
                if (isEmpty && contentState.getBlockMap().size <= 1) {
                    // 마지막 블록이고 비어있으면 더 이상 삭제하지 않음
                    return 'handled';
                }
            }

            // 기본 rich text 명령어 처리
            const newState = RichUtils.handleKeyCommand(editorState, command);
            if (newState) {
                setEditorState(newState);
                return 'handled';
            }

            // 엔터 키 처리
            if (command === 'split-block') {
                if (!isEmpty) {
                    handleSave();
                    setEditorState(EditorState.createEmpty());
                }
                return 'handled';
            }

            return 'not-handled';
        } catch (error) {
            console.error('Key command error:', error);
            return 'not-handled';
        }
    };

    /**
     * ----------------------------------------------------------------
     * (5) Draft.js onChange
     * - 글자 입력 시 첫 입력된 시점을 기록
     * ----------------------------------------------------------------
     */
    const handleEditorChange = (newState: EditorState) => {
        try {
            const contentState = newState.getCurrentContent();
            const hasText = contentState.hasText();

            setEditorState(newState);

            // 첫 입력 시점 기록
            if (!isFirstInputRecorded && hasText) {
                setIsFirstInputRecorded(true);
                setFirstInputTimestamp(props.getTimestamp());
            }
        } catch (error) {
            console.error('Editor change error:', error);
        }
    };

    /**
     * ----------------------------------------------------------------
     * (6) 인라인 스타일 토글(BOLD, ITALIC, UNDERLINE)
     * ----------------------------------------------------------------
     */
    const isStyleActive = (style: string) => editorState.getCurrentInlineStyle().has(style);
    const toggleInlineStyle = (style: string) => {
        setEditorState(prev => RichUtils.toggleInlineStyle(prev, style));
    };

    /**
     * ----------------------------------------------------------------
     * (7) 이미 저장된 메모 수정
     * - 메모 아이템에서 HTML 수정 이벤트 발생 시 서버에도 업데이트
     * ----------------------------------------------------------------
     */
    const handleChangeItem = async (id: string, newHTML: string) => {
        // 로컬 state 업데이트
        setSections(prev => prev.map(s => (s.id === id ? { ...s, htmlContent: newHTML } : s)));

        // 서버 업데이트 (fetch)
        try {
            await memoService.updateMemo({
                id: Number(id),
                timestamp: props.getTimestamp(), // 기존 timestamp 또는 현재 timestamp
                description: newHTML,
            });
        } catch (error) {
            console.error('Failed to update memo:', error);
        }
    };

    /**
     * ----------------------------------------------------------------
     * (8) 메모 삭제
     * - 서버에서 삭제 후 로컬 state에서도 제거
     * ----------------------------------------------------------------
     */
    const handleDeleteItem = async (id: string) => {
        try {
            await memoService.deleteMemo(Number(id));
            setSections(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete memo:', error);
        }
    };

    /**
     * ----------------------------------------------------------------
     * 📌 최종 렌더링
     * (1) 이미 저장된(또는 캡처된) 메모 목록 표시
     * (2) DraftEditor를 통한 새 메모 작성 기능
     * ----------------------------------------------------------------
     */
    return (
        <div className={styles.container}>
            {/* (1) 이미 저장된(또는 캡처된) 메모 목록 */}
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

            {/* (2) Draft Editor */}
            <div className={styles.editorArea}>
                <DraftEditor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="내용을 입력하세요..."
                    keyBindingFn={e => {
                        if (e.key === 'Enter') return 'split-block';
                        if (e.key === 'Backspace') return 'backspace';
                        return getDefaultKeyBinding(e);
                    }}
                    handleKeyCommand={handleKeyCommand}
                    handleBeforeInput={char => {
                        if (char.trim() === '') {
                            const contentState = editorState.getCurrentContent();
                            if (!contentState.hasText()) {
                                return 'handled';
                            }
                        }
                        return 'not-handled';
                    }}
                    onBlur={() => {
                        const contentState = editorState.getCurrentContent();
                        if (!contentState.hasText()) {
                            setEditorState(EditorState.createEmpty());
                            setIsFirstInputRecorded(false);
                            setFirstInputTimestamp(null);
                        }
                    }}
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
                    <button className={styles.addButton} onClick={handleSave}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
});

CustomEditor.displayName = 'CustomEditor';
export default CustomEditor;
