import React, { useState, useEffect, useRef } from 'react';
import { Editor, EditorState, RichUtils } from 'draft-js';
import 'draft-js/dist/Draft.css';
import styles from './editor.module.css';

const DraftEditor = () => {
    const [sections, setSections] = useState<{ timestamp: string; content: string }[]>([]);
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const [isClient, setIsClient] = useState(false);
    const playerRef = useRef<any>(null); // YouTube Player Ref

    useEffect(() => {
        setIsClient(true);

        // YouTube IFrame API를 로드
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: 'pEt89CrE-6A', // 요청된 YouTube 비디오 ID
                events: {
                    onReady: () => {
                        console.log('YouTube Player Ready');
                    },
                },
            });
        };
    }, []);

    // YouTube 현재 재생 시간을 가져오는 함수
    const getTimestamp = () => {
        if (playerRef.current) {
            const time = playerRef.current.getCurrentTime(); // 현재 재생 시간(초)
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
        return '00:00'; // YouTube Player가 준비되지 않았을 때 기본값
    };

    // Editor 상태 변경 핸들러
    const handleEditorChange = (state: EditorState) => {
        setEditorState(state);
    };

    // 저장 버튼 또는 Enter 입력 시 호출
    const handleSave = () => {
        if (!editorState) return;

        const content = editorState.getCurrentContent().getPlainText();
        if (content.trim()) {
            setSections([{ timestamp: getTimestamp(), content }, ...sections]);
            setEditorState(EditorState.createEmpty());
        }
    };

    // Enter 키를 눌렀을 때 저장
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        }
    };

    // 스타일 활성 여부 확인
    const isStyleActive = (style: string): boolean => {
        const currentStyle = editorState.getCurrentInlineStyle();
        return currentStyle.has(style);
    };

    // 텍스트 스타일 토글
    const toggleInlineStyle = (style: string) => {
        setEditorState(RichUtils.toggleInlineStyle(editorState, style));
    };

    if (!isClient) return null;

    return (
        <div className={styles.container}>
            {/* YouTube Player */}
            <div id="youtube-player" className={styles.videoWrapper}></div>

            {/* 저장된 섹션 표시 */}
            <div className={styles.displayArea}>
                {sections.map((section, idx) => (
                    <div key={idx} className={styles.displayItem}>
                        <span className={styles.timestamp}>{section.timestamp}</span>
                        <span className={styles.content}>{section.content}</span>
                    </div>
                ))}
            </div>

            {/* Draft.js 에디터 */}
            <div className={styles.editorArea}>
                <Editor
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
                <div className={styles.toolbar}>
                    <button
                        className={isStyleActive('BOLD') ? styles.activeButton : ''}
                        onClick={() => toggleInlineStyle('BOLD')}
                    >
                        B
                    </button>
                    <button
                        className={isStyleActive('ITALIC') ? styles.activeButton : ''}
                        onClick={() => toggleInlineStyle('ITALIC')}
                    >
                        I
                    </button>
                    <button
                        className={isStyleActive('UNDERLINE') ? styles.activeButton : ''}
                        onClick={() => toggleInlineStyle('UNDERLINE')}
                    >
                        U
                    </button>
                    <button
                        className={isStyleActive('CODE') ? styles.activeButton : ''}
                        onClick={() => toggleInlineStyle('CODE')}
                    >
                        {`< >`}
                    </button>
                    <button className={styles.addButton} onClick={handleSave}>
                        +
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DraftEditor;
