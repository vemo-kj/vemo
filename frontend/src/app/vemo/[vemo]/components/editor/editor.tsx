import { convertToHTML } from 'draft-convert';
import { Editor as DraftEditor, EditorState, RichUtils, getDefaultKeyBinding } from 'draft-js';
import 'draft-js/dist/Draft.css';
import React, { forwardRef, useImperativeHandle, useState } from 'react';
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
                console.log('[Capture Event] Starting capture process:', {
                    eventTimestamp: new Date().toISOString(),
                    hasToken: !!token,
                    timestamp,
                    imageUrlValid: validateBase64Image(imageUrl),
                    imageUrlValid: validateBase64Image(imageUrl),
                });

                if (props.onPauseVideo) {
                    console.log('[Capture Event] Pausing video');
                    props.onPauseVideo();
                }

                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: true,
                    [timestamp]: true,
                }));

                if (!imageUrl || typeof imageUrl !== 'string') {
                    throw new Error('[Capture Event] Invalid image URL format');
                }

                console.log('[Capture Event] Creating memo - videoId:', props.videoId);
                const memosResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}home/memos/${props.videoId}`,
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
                    const errorText = await memosResponse.text();
                    console.error('[Capture Event] Failed to create memo:', {
                        status: memosResponse.status,
                        statusText: memosResponse.statusText,
                        body: errorText,
                        body: errorText,
                    });
                    throw new Error('[Capture Event] Failed to create memo');
                }

                const memosData = await memosResponse.json();
                console.log('[Capture Event] Memo created successfully:', memosData);

                // timestamp를 Date 형식으로 변환
                const [minutes, seconds] = timestamp.split(':').map(Number);
                const date = new Date();
                date.setMinutes(minutes);
                date.setSeconds(seconds);

                // 캡처 저장
                console.log('[Capture Event] Saving capture:', {
                    timestamp: date,
                    memosId: memosData.id,
                    memosId: memosData.id,
                });

                const compressedImage = await compressImage(imageUrl);
                console.log('Original size:', imageUrl.length);
                console.log('Compressed size:', compressedImage.length);

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
                            memos: { id: memosData.id },
                        }),
                    },
                );

                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: false,
                    [timestamp]: false,
                }));

                if (!captureResponse.ok) {
                    const errorText = await captureResponse.text();
                    console.error('[Capture Event] Failed to save capture:', {
                        status: captureResponse.status,
                        statusText: captureResponse.statusText,
                        body: errorText,
                        body: errorText,
                    });
                    throw new Error('[Capture Event] Failed to save capture');
                }

                const data = await captureResponse.json();
                console.log('[Capture Event] Server response data:', data);

                // 이미지 데이터 처리
                let processedImageUrl = data.image;
                if (!processedImageUrl) {
                    console.error('[Capture Event] No image data in server response:', data);
                    throw new Error('[Capture Event] No image data');
                }

                // 이미지 데이터가 base64 형식인지 확인
                if (!processedImageUrl.startsWith('data:image')) {
                    console.log(
                        '[Capture Event] Adding image data prefix:',
                        processedImageUrl.substring(0, 100),
                    );
                    console.log(
                        '[Capture Event] Adding image data prefix:',
                        processedImageUrl.substring(0, 100),
                    );
                    processedImageUrl = `data:image/png;base64,${processedImageUrl}`;
                    console.log(
                        '[Capture Event] Image data prefix added:',
                        processedImageUrl.substring(0, 100),
                    );
                    console.log(
                        '[Capture Event] Image data prefix added:',
                        processedImageUrl.substring(0, 100),
                    );
                }

                // 로컬 상태 업데이트
                const newItem: Section = {
                    id: `capture-${data.id}`,
                    timestamp,
                    htmlContent: '',
                    screenshot: processedImageUrl,
                };

                console.log('[Capture Event] New section item created:', {
                    id: newItem.id,
                    timestamp: newItem.timestamp,
                    screenshotLength: newItem.screenshot?.length || 0,
                    screenshotStart: newItem.screenshot?.substring(0, 100) || 'No screenshot',
                    screenshotStart: newItem.screenshot?.substring(0, 100) || 'No screenshot',
                });

                setSections(prev => [...prev, newItem]);
                console.log('[Capture Event] Section update completed');
                props.onMemoSaved?.();
            } catch (error) {
                console.error('[Capture Event] Error in capture process:', error);
                setImageLoadingStates(prev => ({
                    ...prev,
                    [timestamp]: false,
                    [timestamp]: false,
                }));
                throw error;
            }
        },
    }));

   

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
                timestamp: date.toISOString(), // ISO 문�열로 변환
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


    
    const handleChangeItem = async (id: string, newHTML: string)=> {
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

    const handleDeleteItem = async (id: string) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                return;
            }

            // id에서 숫자만 추출 (예: "memo-123" -> 123)
            const memoId = parseInt(id.split('-')[1]);

            // 백엔드 요청
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

            // 성공적으로 삭제되면 프론트엔드 상태 업데이트
            const updatedSections = sections.filter(item => item.id !== id);
            setSections(updatedSections);

        } catch (error) {
            console.error('메모 삭제 중 오류 발생:', error);
        }
    };


     // const handleSave = async () => {
    //     const contentState = editorState.getCurrentContent();
    //     if (!contentState.hasText()) return;

    //     try {
    //         const token = sessionStorage.getItem('token');
    //         if (!token) {
    //             console.error('토큰이 없습니다.');
    //             return;
    //         }

    //         const html = convertToHTML(contentState);
    //         const timestamp = props.getTimestamp();

    //         const response = await fetch(`http://localhost:5050/home/memos/${props.videoId}`, {
    //             method: 'POST',
    //             headers: {
    //                 'Authorization': `Bearer ${token}`,
    //                 'Content-Type': 'application/json'
    //             },
    //             credentials: 'include'
    //         });

    //         if (!response.ok) {
    //             const errorText = await response.text();
    //             console.error('서버 응답:', {
    //                 status: response.status,
    //                 statusText: response.statusText,
    //                 body: errorText
    //             });
    //             throw new Error('메모 저장에 실패했습니다.');
    //         }

    //         const data = await response.json();
    //         console.log('메모 저장 성공:', data);

    //         props.onMemoSaved?.();

    //         const newItem: Section = {
    //             id: `memo-${Date.now()}`,
    //             timestamp,
    //             htmlContent: html,
    //         };

    //         setSections(prev => [...prev, newItem]);
    //         setEditorState(EditorState.createEmpty());

    //     } catch (error) {
    //         console.error('메모 저장 실패:', error);
    //     }
    // };
        
    // const handleChangeItem = (id: string, newHTML: string) => {
    //     const updatedSections = sections.map(item => {
    //         if (item.id === id) {
    //             return {
    //                 ...item,
    //                 htmlContent: newHTML,
    //             };
    //         }
    //         return item;
    //     });
    //     setSections(updatedSections);
    // };

    // const handleDeleteItem = (id: string) => {
    //     const updatedSections = sections.filter(item => item.id !== id);
    //     setSections(updatedSections);
    // };

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
