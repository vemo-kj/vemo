import { Editor as DraftEditor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import styles from './editor.module.css';
import MemoItem from './MemoItem';

// DraftEditor를 위한 타입 정의 추가
const Editor = DraftEditor as unknown as React.ComponentType<{
    editorState: EditorState;
    onChange: (state: EditorState) => void;
    placeholder?: string;
    keybinding?: (e: any) => void;
    handleKeyCommand?: (command: string) => 'handled' | 'not-handled';
    keyBindingFn?: (e: any) => string | null;
}>;

interface Section {
    id: string;
    timestamp: string;
    htmlContent: string;
    screenshot?: string;
}

interface Memo {
    id: number;
    timestamp: string;
    description: string;
}

interface Captures {
    id: number;
    createdAt: Date;
    imageUrl: string;
}

interface MemoListResponse {
    id: number;
    title: string;
    createdAt: Date;
    memo: Memo[];
    captures: Captures[];
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
}

// ref 타입 정의
interface EditorRef {
    addCaptureItem: (timestamp: string, imageUrl: string) => void;
}

function parseTimeToSeconds(timestamp: string): number {
    const [mm, ss] = timestamp.split(':').map(Number);
    return (mm || 0) * 60 + (ss || 0);
}

// base64 이미지 데이터 검증 함수
const validateBase64Image = (base64String: string) => {
    console.log('[Capture Event] Validating image data:', {
        isString: typeof base64String === 'string',
        length: base64String?.length,
        startsWithData: base64String?.startsWith('data:'),
        containsBase64: base64String?.includes('base64'),
        firstChars: base64String?.substring(0, 50) + '...',
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

const compressImage = async (base64Image: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            // 원본 비율 유지하면서 최대 너비/높이 설정
            const MAX_WIDTH = 1024;
            const MAX_HEIGHT = 1024;
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // 0.8은 80% 품질을 의미합니다 - 적절한 압축률
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
            resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = base64Image;
    });
};

const CustomEditor = forwardRef<EditorRef, Omit<CustomEditorProps, 'ref'>>((props, ref) => {
    const [sections, setSections] = useState<Section[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});

    useImperativeHandle(ref, () => ({
        addCaptureItem: async (timestamp: string, imageUrl: string) => {
            try {
                const token = sessionStorage.getItem('token');
                console.log('[Capture Event] Starting capture process');

                if (props.onPauseVideo) {
                    props.onPauseVideo();
                }

                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: true,
                }));

                // 1. 이미지 압축
                const compressedImage = await compressImage(imageUrl);
                console.log('Image compressed:', {
                    originalSize: imageUrl.length,
                    compressedSize: compressedImage.length
                });

                // 2. 메모 생성
                const memosResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/home/memos/${props.videoId}`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    },
                );

                if (!memosResponse.ok) {
                    throw new Error('Failed to create memo');
                }

                const memosData = await memosResponse.json();

                // 3. timestamp를 Date 형식으로 변환
                const [minutes, seconds] = timestamp.split(':').map(Number);
                const date = new Date();
                date.setMinutes(minutes);
                date.setSeconds(seconds);

                // 4. 캡처 저장 요청
                const captureResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/captures`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            timestamp: date.toISOString(),
                            image: compressedImage,
                            memosId: memosData.id
                        }),
                    },
                );

                if (!captureResponse.ok) {
                    throw new Error('Failed to save capture');
                }

                const captureData = await captureResponse.json();

                // 5. 새로운 캡처 아이템 추가
                const newItem: Section = {
                    id: `capture-${captureData.id}`,
                    timestamp,
                    htmlContent: '',
                    screenshot: captureData.image // S3 URL이 반환됨
                };

                setSections(prev => [...prev, newItem]);
                props.onMemoSaved?.();

            } catch (error) {
                console.error('[Capture Event] Error:', error);
                throw error;
            } finally {
                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: false,
                    [timestamp]: false,
                }));
            }
        },
    }));

    useEffect(() => {
        const fetchMemos = async () => {
            try {
                const token = sessionStorage.getItem('token');
                console.log('Current memosId:', props.memosId); // memosId 값 확인
                console.log('Token exists:', !!token); // 토큰 존재 여부 확인

                if (!token || !props.memosId) {
                    console.log('Token or memosId is missing:', { token: !!token, memosId: props.memosId });
                    return;
                }

                const url = `http://localhost:5050/memos/${props.memosId}`;
                console.log('Fetching from URL:', url); // 요청 URL 확인

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include'
                });

                console.log('Response status:', response.status); // 응답 상태 확인

                if (!response.ok) {
                    console.error('Response status:', response.status);
                    throw new Error('메모를 불러오는데 실패했습니다.');
                }

                const memosData = await response.json();
                console.log('Received 마어람널앙ㅁㄴ러만ㅇ러만어만ㅇ럼ㄹ나ㅓㅁㄴ아ㅓ러 data:', memosData); // 데이터 확인용 로그

                // memo와 captures 데이터를 sections 형식으로 변환
                const formattedSections = [
                    // memo 데이터 변환
                    ...memosData.memo.map((memo: any) => {
                        // timestamp를 MM:SS 형식으로 변환
                        const date = new Date(memo.timestamp);
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const seconds = date.getSeconds().toString().padStart(2, '0');
                        const formattedTimestamp = `${minutes}:${seconds}`;

                        return {
                            id: `memo-${memo.id}`,
                            timestamp: formattedTimestamp,
                            htmlContent: memo.description,
                            screenshot: null
                        };
                    }),
                    // captures 데이터 변환
                    ...memosData.captures.map((capture: any) => {
                        const date = new Date(capture.timestamp);
                        const minutes = date.getMinutes().toString().padStart(2, '0');
                        const seconds = date.getSeconds().toString().padStart(2, '0');
                        const formattedTimestamp = `${minutes}:${seconds}`;

                        return {
                            id: `capture-${capture.id}`,
                            timestamp: formattedTimestamp,
                            htmlContent: '',
                            screenshot: capture.image
                        };
                    })
                ].sort((a, b) => {
                    // timestamp를 기준으로 정렬
                    const [aMin, aSec] = a.timestamp.split(':').map(Number);
                    const [bMin, bSec] = b.timestamp.split(':').map(Number);
                    return (aMin * 60 + aSec) - (bMin * 60 + bSec);
                });

                setSections(formattedSections);
                console.log('Loaded sections:', formattedSections);

            } catch (error) {
                console.error('메모 목� 불러오기 실패:', error);
            }
        };

        fetchMemos();
    }, [props.memosId]); // props.memosId가 변경될 때마다 실행

    const handleSave = async () => {
        const contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) return;

        try {
            const token = sessionStorage.getItem('token');
            if (!token || !props.memosId) {
                console.error('토큰 또는 memosId가 없습니다.');
                return;
            }

            const html = convertToHTML(contentState);
            const timestamp = props.getTimestamp();

            // timestamp 형식 변환 추가
            const [minutes, seconds] = timestamp.split(':').map(Number);
            const date = new Date();
            date.setMinutes(minutes);
            date.setSeconds(seconds);

            const requestData = {
                timestamp: date.toISOString(), // ISO 문자열로 변환
                description: html,
                memosId: Number(props.memosId)
            };

            console.log('Sending memo data:', requestData);

            const response = await fetch(`http://localhost:5050/memo/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestData)
            });

            // 자세한 에러 로깅
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 요청 실패:', {
                    url: response.url,
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                    body: errorText,
                });
                throw new Error(`메모 저장 실패: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('메모 저장 성공:', data);

            const newItem: Section = {
                id: `memo-${data.id}`,
                timestamp,
                htmlContent: html,
            };

            setSections(prev => [...prev, newItem]);
            setEditorState(EditorState.createEmpty());
            props.onMemoSaved?.();

        } catch (error) {
            console.error('메모 저장 실패:', error);
        }
    };


    const handleChangeItem = async (id: string, newHTML: string) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            // id에서 숫자만 추출 (예: "memo-123" -> 123)
            const memoId = parseInt(id.split('-')[1]);
            console.log('memoId:', memoId);

            // 백엔드 요청
            const response = await fetch(`http://localhost:5050/memo/${memoId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    id: memoId,
                    description: newHTML
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('메모 수정 실패:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
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

    // 캡처 삭제를한로운 함수
    const handleDeleteCapture = async (captureId: string) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            const id = captureId.split('-')[1]; // 'capture-123' -> '123'
            console.log('Deleting capture:', { captureId, id });

            const response = await fetch(`http://localhost:5050/captures/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('캡처 삭제 실패:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
                });
                throw new Error('캡처 삭제에 실패했습니다.');
            }

            // 성공적으로 삭제되면 프론트엔드 상태 업데이트
            setSections(prev => prev.filter(item => item.id !== captureId));

        } catch (error) {
            console.error('캡처 삭제 중 오류 발생:', error);
        }
    };

    // 기존 handleDeleteItem 함수정
    const handleDeleteItem = async (id: string) => {
        // 캡처인 경우 handleDeleteCapture 함수 호출
        if (id.startsWith('capture-')) {
            return handleDeleteCapture(id);
        }

        // 기존 메모제 로직
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            const memoId = id.split('-')[1];
            const response = await fetch(`http://localhost:5050/memo/${memoId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('메모 삭제 실패:', {
                    status: response.status,
                    statusText: response.statusText,
                    error: errorText
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
            handleSave();
            return 'handled';
        }
        return 'not-handled';
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
                        onChangeHTML={newHTML => handleChangeItem(item.id, newHTML)}
                        onChangeHTML={newHTML => handleChangeItem(item.id, newHTML)}
                        onDelete={() => handleDeleteItem(item.id)}
                        onPauseVideo={props.onPauseVideo}
                        isEditable={props.isEditable}
                    />
                ))}
            </div>
            <div className={styles.editorArea}>
                <Editor
                    editorState={editorState}
                    onChange={setEditorState}
                    placeholder="내용을 입력하세요..."
                    handleKeyCommand={handleKeyCommand}
                    keyBindingFn={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            return 'split-block';
                        }
                        return getDefaultKeyBinding(e);
                    }}
                />
                <div className={styles.toolbar}>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('BOLD') ? styles.activeButton : ''}`}
                        onMouseDown={e => {
                        onMouseDown={e => {
                            e.preventDefault();
                            toggleInlineStyle('BOLD');
                        }}
                    >
                        B
                    </button>
                    <button
                        className={`${styles.styleButton} ${isStyleActive('ITALIC') ? styles.activeButton : ''}`}
                        onMouseDown={e => {
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
