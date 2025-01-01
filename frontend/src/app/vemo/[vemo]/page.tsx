"use client";

import React, { useRef, useEffect, useState, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import SideBarNav from './components/sideBarNav/sideBarNav';
import { useParams, useRouter } from 'next/navigation';

import { SummaryProvider } from './context/SummaryContext';


// 동적 로드된 DraftEditor
const EditorNoSSR = dynamic<CustomEditorProps>(() => import('./components/editor/editor'), { ssr: false });

interface CustomEditorProps {
    ref?: React.Ref<unknown>;
    getTimestamp: () => string;
    onTimestampClick: (timestamp: string) => void;
    isEditable?: boolean;
    editingItemId?: string | null;
    onEditStart?: (itemId: string) => void;
    onEditEnd?: () => void;
}

// 페이지 컴포넌트의 props 타입 정의 추가
interface PageProps {
  params: {
    vemo: string;
  };
}

export default function VemoPage() {
    const router = useRouter();
    const params = useParams();
    const videoId = params.vemo as string;
    const playerRef = useRef<any>(null);
    const editorRef = useRef<any>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    // const [videoId, setVideoId] = useState('pEt89CrE-6A');

    useEffect(() => {
        if (!videoId) return;

        // 기존 player가 있다면 제거
        if (playerRef.current) {
            playerRef.current.destroy();
        }

        // YouTube Iframe API 로드
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // YouTube Player 초기화
        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: videoId,
                events: {
                    onReady: () => {
                        console.log('Player ready');
                        // Player 준비되면 timestamp 업데이트 시작
                        startTimestampUpdate();
                    },
                },
            });
        };
    }, [videoId]);

    // timestamp 업데이트 함수를 별도로 분리
    const startTimestampUpdate = () => {
        const interval = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                const sec = playerRef.current.getCurrentTime();
                const mm = Math.floor(sec / 60);
                const ss = Math.floor(sec % 60);
                setCurrentTimestamp(`${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    };

    // timestamp 업데이트 useEffect 수정
    useEffect(() => {
        if (editingItemId !== null) return;
        return startTimestampUpdate();
    }, [editingItemId]);

    // 드롭다운 선택
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // 노트 아이템에서 timestamp 버튼 클릭 → 해당 시각으로 이동
    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    // (캡처) 메시지 수신 → editorRef.current?.addCaptureItem
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'CAPTURE_TAB_RESPONSE') {
                editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
            } else if (e.data.type === 'CAPTURE_AREA_RESPONSE') {
                editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [currentTimestamp]);

    // 전체/부분 캡처
    const handleCaptureTab = () => {
        window.postMessage({ type: 'CAPTURE_TAB' }, '*');
    };
    // 부분 캡처
    const handleCaptureArea = () => {
        window.postMessage({ type: 'CAPTURE_AREA' }, '*');
    };
    // 캡처 기능 끝

    // 섹션 내용 렌더링
    const renderSectionContent = () => {
        switch (selectedOption) {
            case '내 메모 보기':
                return (
                    <>
                        <p className={styles.noteTitle}>내 메모 내용을 여기에 표시</p>
                        <EditorNoSSR
                            ref={editorRef}
                            getTimestamp={() => currentTimestamp}
                            onTimestampClick={(timestamp: string) => {
                                const [m, s] = timestamp.split(':').map(Number);
                                const total = (m || 0) * 60 + (s || 0);
                                playerRef.current?.seekTo(total, true);
                            }}
                            isEditable={true}
                            editingItemId={editingItemId}
                            onEditStart={(itemId: string) => setEditingItemId(itemId)}
                            onEditEnd={() => setEditingItemId(null)}
                        />
                    </>
                );
            // 후에 내용별 반영 예정
            case 'AI 요약 보기':
                return <p className={styles.noteTitle}>AI 요약 내용을 여기에 표시</p>;
            case '옵션 3':
                return <p className={styles.noteTitle}>옵션 3의 내용을 여기에 표시</p>;
            default:
                return <p className={styles.noteTitle}>기본 내용을 여기에 표시</p>;
        }
    };

    const changeVideo = (newVideoId: string) => {
        router.push(`/vemo/${newVideoId}`);
    };

    return (
        <div className={styles.container}>

            {/* (1) 유튜브 영상 섹션 */}
            <div className={styles.section1} style={{ position: 'relative' }}>
                <Link href="/" passHref>
                    <img src="/icons/Button_home.svg" alt="VEMO logo" className={styles.logoButton} />
                </Link>
                <div className={styles.videoWrapper}>
                    <iframe
                        id="youtube-player"
                        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                        title="YouTube Video Player"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
                <button onClick={() => changeVideo('새로운_비디오_ID')}>
                    {/* 다른 영상으로 변경 */}
                </button>
            </div>

            {/* (3) Sidebar */}
            <div className={styles.section3}>
                <SummaryProvider>
                    <SideBarNav
                        selectedOption={selectedOption} // 선택된 옵션
                        onOptionSelect={handleOptionSelect} // 옵션 선택 함수
                        renderSectionContent={renderSectionContent} // 섹션 내용 렌더링
                        currentTimestamp={currentTimestamp} // 현재 재생 시간
                        handleCaptureTab={handleCaptureTab} // 캡처 기능
                        handleCaptureArea={handleCaptureArea} // 캡처 기능
                        editorRef={editorRef} // 추가
                    />
                </SummaryProvider>
            </div>

        </div>
    );
}

