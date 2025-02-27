import { convertToHTML } from 'draft-convert';
import {
    Editor as DraftEditor,
    EditorState,
    getDefaultKeyBinding,
    Modifier,
    RichUtils,
} from 'draft-js';
import 'draft-js/dist/Draft.css';
import React, { forwardRef, useEffect, useImperativeHandle, useState, useRef } from 'react';
import styles from './editor.module.css';

import { CreateMemosResponseDto } from '@/app/types/vemo.types';
import { useSummary } from '../../context/SummaryContext';
import MemoItem from '../editor/MemoItem';

// DraftEditor를 위한 타입 정의 수정
const Editor = DraftEditor as unknown as React.ComponentType<{
    editorState: EditorState;
    onChange: (state: EditorState) => void;
    placeholder?: string;
    handleKeyCommand?: (command: string) => 'handled' | 'not-handled';
    keyBindingFn?: (e: React.KeyboardEvent) => string | null;
    onFocus?: () => void;
}>;

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
    memosId: number | null;
    vemoData: CreateMemosResponseDto | null;
    onDrawingStart?: (captureId: string) => void;
}

// ref 타입 정의
interface EditorRef {
    addCaptureItem: (timestamp: string, imageUrl: string, captureId?: string) => void;
    addTextToEditor?: (text: string) => void;
}

// 시간 변환 유틸리티 함수들
const formatVideoTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const parseTimeToSeconds = (timestamp: string): number => {
    const parts = timestamp.split(':').map(Number);
    if (parts.length === 2) {
        const [minutes, seconds] = parts;
        return minutes * 60 + seconds;
    }
    return 0;
};

// 정렬 함수 수정
const sortByTimestamp = (sections: Section[]) => {
    return [...sections].sort((a, b) => {
        const aSeconds = parseTimeToSeconds(a.timestamp);
        const bSeconds = parseTimeToSeconds(b.timestamp);
        return aSeconds - bSeconds;
    });
};

// base64 이미지 데이터 검증 함수
const validateBase64Image = (base64String: string) => {
    console.log('[Capture Event] Validating image data:', {
        isString: typeof base64String === 'string',
        length: base64String?.length,
        startsWithData: base64String?.startsWith('data:'),
        containsBase64: base64String?.includes('base64'),
        firstChars: base64String?.substring(0, 50) + '...',
    });

    if (!base64String || typeof base64String !== 'string') {
        console.error('[Capture Event] Invalid image data: Not a string');
        return false;
    }

    if (!base64String.startsWith('data:image/')) {
        console.error('[Capture Event] Invalid image data: Does not start with data:image/');
        return false;
    }

    if (!base64String.includes('base64,')) {
        console.error('[Capture Event] Invalid image data: No base64 marker');
        return false;
    }

    return true;
};

const CustomEditor = forwardRef<EditorRef, CustomEditorProps>((props, ref) => {
    const { resetData } = useSummary();
    const [sections, setSections] = useState<Section[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
    const [memoStartTimestamp, setMemoStartTimestamp] = useState<string | null>(null);
    const displayAreaRef = useRef<HTMLDivElement>(null);

    // 텍스트를 에디터에 추가하는 함수
    const addTextToEditor = (text: string) => {
        const contentState = editorState.getCurrentContent();
        const selection = editorState.getSelection();
        const newContent = Modifier.insertText(
            contentState,
            selection,
            text
        );
        const newEditorState = EditorState.push(
            editorState,
            newContent,
            'insert-characters'
        );
        setEditorState(newEditorState);
    };

    useImperativeHandle(ref, () => ({
        addCaptureItem: async (timestamp: string, imageUrl: string, captureId?: string) => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                if (props.onPauseVideo) {
                    props.onPauseVideo();
                }

                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: true,
                }));

                // 이미지 데이터 검증 및 처리
                if (!imageUrl) {
                    throw new Error('Image data is required');
                }

                // base64 데이터 정제
                let processedImage = imageUrl;

                if (!processedImage.startsWith('data:image/')) {
                    // 순수 Base64만 넘어온 경우 (확장 프로그램 sanitize 상태)
                    processedImage = `data:image/png;base64,${processedImage}`;
                }

                if (imageUrl.includes('base64')) {
                    const base64Match = imageUrl.match(/base64,(.+)/);
                    if (base64Match) {
                        processedImage = base64Match[1];
                    }
                }

                // 데이터 유효성 검사
                if (!processedImage) {
                    throw new Error('Failed to process image data');
                }

                console.log('[Capture Event] Sending capture request:', {
                    timestamp: props.getTimestamp(),
                    memosId: props.memosId,
                    imageDataLength: processedImage.length,
                });

                const requestBody = {
                    timestamp: props.getTimestamp(),
                    image: processedImage,
                    memosId: props.memosId,
                };

                // 요청 데이터 검증
                if (typeof requestBody.image !== 'string') {
                    throw new Error('Image data must be a string');
                }

                // 요청 데이터 검증
                if (typeof requestBody.image !== 'string') {
                    throw new Error('Image data must be a string');
                }

                // 요청 데이터 검증
                if (typeof requestBody.image !== 'string') {
                    throw new Error('Image data must be a string');
                }

                // 요청 데이터 검증
                if (typeof requestBody.image !== 'string') {
                    throw new Error('Image data must be a string');
                }

                const captureResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/captures`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(requestBody),
                    },
                );

                if (!captureResponse.ok) {
                    const errorText = await captureResponse.text();
                    console.error('[Capture Event] Server response:', {
                        status: captureResponse.status,
                        body: errorText,
                    });
                    throw new Error(
                        `Failed to save capture: ${captureResponse.status} ${errorText}`,
                    );
                }

                const captureData = await captureResponse.json();
                console.log('[Capture Event] Capture saved:', captureData);

                const newSection: Section = {
                    id: `capture-${captureData.id}`,
                    timestamp: timestamp,
                    htmlContent: '',
                    screenshot: captureData.image,
                };

                setSections(prev =>
                    [...prev, newSection].sort((a, b) => {
                        const aSeconds = parseTimeToSeconds(a.timestamp);
                        const bSeconds = parseTimeToSeconds(b.timestamp);
                        return aSeconds - bSeconds;
                    }),
                );

                // 캡처 저장 후 스크롤 이동 추가
                setTimeout(scrollToBottom, 100);

                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: false,
                }));

                if (props.onMemoSaved) {
                    props.onMemoSaved();
                }
            } catch (error) {
                console.error('[Capture Event] Error:', {
                    message: error instanceof Error ? error.message : 'Unknown error',
                    type: typeof error,
                    error,
                });

                console.error('[Capture Event] Error:', error);
                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: false,
                }));
            }
        },
        addTextToEditor,
    }));

    useEffect(() => {
        const fetchMemos = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || !props.memosId) {
                    console.log('Token or memosId is missing');
                    return;
                }

                const url = `${process.env.NEXT_PUBLIC_BASE_URL}/memos/${props.memosId}`;
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('메모를 불러오는데 실패했습니다.');
                }

                const memosData = await response.json();

                // memo와 captures 데이터를 sections 형식으로 변환
                const formattedSections = [
                    // memo 데이터 변환
                    ...memosData.memo.map((memo: any) => {
                        console.log('Memo timestamp before conversion:', memo.timestamp);

                        // timestamp가 숫자(초)로 들어온다고 가정하고 변환
                        let minutes = '00';
                        let seconds = '00';

                        if (memo.timestamp) {
                            if (
                                typeof memo.timestamp === 'string' &&
                                memo.timestamp.includes(':')
                            ) {
                                // MM:SS 형식인 경우
                                [minutes, seconds] = memo.timestamp.split(':');
                            } else {
                                // 초 단위 숫자나 다른 형식인 경우
                                const totalSeconds = Math.floor(Number(memo.timestamp));
                                minutes = Math.floor(totalSeconds / 60)
                                    .toString()
                                    .padStart(2, '0');
                                seconds = (totalSeconds % 60).toString().padStart(2, '0');
                            }
                        }

                        const formattedTimestamp = `${minutes}:${seconds}`;
                        console.log('Memo timestamp after conversion:', formattedTimestamp);

                        return {
                            id: `memo-${memo.id}`,
                            timestamp: formattedTimestamp,
                            htmlContent: memo.description,
                            screenshot: null,
                        };
                    }),
                    // captures 데이터 변환 (기존 방식 유지)
                    ...memosData.captures.map((capture: any) => {
                        console.log('Capture timestamp before conversion:', capture.timestamp);

                        let minutes = '00';
                        let seconds = '00';

                        if (capture.timestamp) {
                            if (
                                typeof capture.timestamp === 'string' &&
                                capture.timestamp.includes(':')
                            ) {
                                [minutes, seconds] = capture.timestamp.split(':');
                            } else {
                                const totalSeconds = Math.floor(Number(capture.timestamp));
                                minutes = Math.floor(totalSeconds / 60)
                                    .toString()
                                    .padStart(2, '0');
                                seconds = (totalSeconds % 60).toString().padStart(2, '0');
                            }
                        }

                        const formattedTimestamp = `${minutes}:${seconds}`;
                        console.log('Capture timestamp after conversion:', formattedTimestamp);

                        return {
                            id: `capture-${capture.id}`,
                            timestamp: formattedTimestamp,
                            htmlContent: '',
                            screenshot: capture.image,
                        };
                    }),
                ].sort((a, b) => {
                    // timestamp를 기준으로 정렬
                    const [aMin, aSec] = a.timestamp.split(':').map(Number);
                    const [bMin, bSec] = b.timestamp.split(':').map(Number);
                    return aMin * 60 + aSec - (bMin * 60 + bSec);
                });
                console.log('memosData.memo:', memosData.memo);

                setSections(formattedSections);
                console.log('Loaded sections:', formattedSections);
            } catch (error) {
                console.error('메모 목록 불러오기 실패:', error);
            }
        };

        fetchMemos();
    }, [props.memosId]);

    // 에디터에 포커스가 들어올 때 타임스탬프 설정
    const handleEditorFocus = () => {
        if (!editorState.getCurrentContent().hasText()) {
            // 에디터가 비어있을 때만 새 타임스탬프 설정
            setMemoStartTimestamp(props.getTimestamp());
        }
    };

    // 에디터 내용이 변경될 때
    const handleEditorChange = (newState: EditorState) => {
        const hasText = newState.getCurrentContent().hasText();
        const hadText = editorState.getCurrentContent().hasText();

        // 텍스트가 모두 지워졌다가 다시 입력 시작할 때
        if (!hadText && hasText) {
            setMemoStartTimestamp(props.getTimestamp());
        }

        setEditorState(newState);
    };

    // 스크롤을 맨 아래로 이동시키는 함수
    const scrollToBottom = () => {
        if (displayAreaRef.current) {
            displayAreaRef.current.scrollTop = displayAreaRef.current.scrollHeight;
        }
    };

    // 저장 시에는 memoStartTimestamp 사용
    const handleSave = async () => {
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) return;

        try {
            // 저장할 때는 메모 시작 시점의 타임스탬프 사용
            const timestamp = memoStartTimestamp || props.getTimestamp();
            console.log('Saving with timestamp:', timestamp);

            const html = convertToHTML(contentState);
            const requestData = {
                timestamp,
                description: html,
                memosId: Number(props.memosId),
            };

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error('메모 저장에 실패했습니다.');
            }

            const data = await response.json();

            const newItem: Section = {
                id: `memo-${data.id}`,
                timestamp,
                htmlContent: html,
            };

            setSections(prev => sortByTimestamp([...prev, newItem]));

            // 저장 후 초기화
            setMemoStartTimestamp(null);
            setEditorState(EditorState.createEmpty());
            props.onMemoSaved?.();

            // 저장 후 스크롤 이동
            setTimeout(scrollToBottom, 100);

        } catch (error) {
            console.error('메모 저장 실패:', error);
        }
    };

    const handleChangeItem = async (id: string, newHTML: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            // id에서 숫자만 추출 (예: "memo-123" -> 123)
            const memoId = parseInt(id.split('-')[1]);
            console.log('memoId:', memoId);

            // 백엔드 요청
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${memoId}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: memoId,
                    description: newHTML,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('메모 수정 실패:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                });
                throw new Error('메모 수정에 실패했습니다.');
            }

            // 프론트엔드 상태 업데이트
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
        } catch (error) {
            console.error('메모 수정 중 오류 발생:', error);
        }
    };

    // 캡처 삭제를 위한 새로운 함수
    const handleDeleteCapture = async (captureId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            const id = captureId.split('-')[1]; // 'capture-123' -> '123'
            console.log('Deleting capture:', { captureId, id });

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/captures/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('캡처 삭제 실패:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                });
                throw new Error('캡처 삭제에 실패했습니다.');
            }

            // 성공적으로 삭제되면 프론트엔드 상태 업데이트
            setSections(prev => prev.filter(item => item.id !== captureId));
        } catch (error) {
            console.error('캡처 삭제 중 오류 발생:', error);
        }
    };

    // 기존 handleDeleteItem 함수 정의
    const handleDeleteItem = async (id: string) => {
        // 캡처인 경우 handleDeleteCapture 함수 호출
        if (id.startsWith('capture-')) {
            return handleDeleteCapture(id);
        }

        // 기존 메모 삭제 로직
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            const memoId = id.split('-')[1];
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memo/${memoId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('메모 삭제 실패:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText,
                });
                throw new Error('메모 삭제에 실패했습니다.');
            }

            setSections(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('메모 삭제 중 오류 발생:', error);
        }
    };

    // 인라인 스타일 토글 함수 추가
    const toggleInlineStyle = (style: string) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    // 현재 스타일 상태 확인 함수 추가
    const isStyleActive = (style: string) => {
        return editorState.getCurrentInlineStyle().has(style);
    };

    const handleKeyCommand = (command: string) => {
        if (command === 'split-block') {
            const contentState = editorState.getCurrentContent();
            const selection = editorState.getSelection();
            const currentBlock = contentState.getBlockForKey(selection.getStartKey());

            // 현재 블록의 텍스트가 있을 때만 저장 처리
            if (currentBlock.getText().length > 0) {
                handleSave();
                return 'handled';
            }
        }
        return 'not-handled';
    };

    // keyBindingFn 수정
    const keyBindingFn = (e: React.KeyboardEvent<{}>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // 기본 Enter 동작 방지
            const contentState = editorState.getCurrentContent();
            const selection = editorState.getSelection();
            const currentBlock = contentState.getBlockForKey(selection.getStartKey());

            // 텍스트가 있을 때만 'split-block' 커맨드 반환
            if (currentBlock.getText().length > 0) {
                return 'split-block';
            }
        }
        return getDefaultKeyBinding(e);
    };

    // 메모카드 변경 감지
    useEffect(() => {
        resetData();
    }, [props.editingItemId]);

    return (
        <div className={styles.container}>
            <div ref={displayAreaRef} className={styles.displayArea}>
                {sections.map(item => (
                    <MemoItem
                        key={item.id}
                        id={item.id}
                        timestamp={item.timestamp}
                        htmlContent={item.htmlContent}
                        screenshot={item.screenshot}
                        onTimestampClick={props.onTimestampClick}
                        onChangeHTML={newHTML => handleChangeItem(item.id, newHTML)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onPauseVideo={props.onPauseVideo}
                        isEditable={props.isEditable}
                        onDrawingStart={props.onDrawingStart}
                        addTextToEditor={addTextToEditor}
                    />
                ))}
            </div>
            <div className={styles.editorArea}>
                <Editor
                    editorState={editorState}
                    onChange={handleEditorChange}
                    placeholder="내용을 입력하세요..."
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={keyBindingFn}
                    onFocus={handleEditorFocus}
                />
                <div className={styles.toolbar}>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('BOLD') ? styles.activeButton : ''}`}
                        onMouseDown={e => {
                            e.preventDefault(); // 이벤트 기본 동작 방지
                            toggleInlineStyle('BOLD');
                        }}
                    >
                        B
                    </button>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('ITALIC') ? styles.activeButton : ''}`}
                        onMouseDown={e => {
                            e.preventDefault();
                            toggleInlineStyle('ITALIC');
                        }}
                    >
                        I
                    </button>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('UNDERLINE') ? styles.activeButton : ''}`}
                        onMouseDown={e => {
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
