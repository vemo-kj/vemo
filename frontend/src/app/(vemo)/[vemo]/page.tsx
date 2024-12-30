'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link'; // [중요] page1에 있던 Link
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DropdownMenu from './components/DropdownMenu';

// 동적 로드된 DraftEditor
const EditorNoSSR = dynamic(() => import('./components/editor/editor'), { ssr: false });
export default function VemoPage() {
    const playerRef = useRef<any>(null);
    const editorRef = useRef<any>(null);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');

    useEffect(() => {
        // YouTube Iframe API 로드
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: 'pEt89CrE-6A',
                events: {
                    onReady: () => console.log('Player ready'),
                },
            });
        };
    }, []);

    // 1초마다 현재 재생 시간 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                const sec = playerRef.current.getCurrentTime();
                const mm = Math.floor(sec / 60);
                const ss = Math.floor(sec % 60);
                setCurrentTimestamp(
                    `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
                );
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

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

    // 영상 일시정지 (그리기 등에서 사용)
    const pauseVideo = () => {
        playerRef.current?.pauseVideo();
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
    const handleCaptureArea = () => {
        window.postMessage({ type: 'CAPTURE_AREA' }, '*');
    };

    return (
        <div className={styles.container}>
            {/* (1) 유튜브 영상 섹션 */}
            <div className={styles.section1} style={{ position: 'relative' }}>
                <Link href="/" passHref>
                    <img
                        src="/icons/Button_home.svg"
                        alt="VEMO logo"
                        className={styles.logoButton}
                    />
                </Link>
                <div className={styles.videoWrapper}>
                    <iframe
                        id="youtube-player"
                        src="https://www.youtube.com/embed/pEt89CrE-6A?enablejsapi=1"
                        title="YouTube Video Player"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
            </div>

            {/* (2) 노트 / 에디터 영역 */}
            <div className={styles.section2}>
                <h1 className={styles.notesHeader}>나만의 노트</h1>
                <p className={styles.notesSubHeader}>자바 스크립트 스터디 재생목록</p>

                <div className={styles.notesContent}>
                    <p className={styles.noteTitle}>자바 스크립트 스터디</p>
                    <div className={styles.noteActions}>
                        <div className={styles.dropdown}>
                            <DropdownMenu
                                options={['내 메모 보기', 'AI 요약 보기', '옵션 3']}
                                defaultOption={selectedOption}
                                onSelect={handleOptionSelect}
                            />
                        </div>
                    </div>
                </div>

                <EditorNoSSR
                    ref={editorRef}
                    getTimestamp={() => currentTimestamp}
                    onTimestampClick={handleSeekToTime}
                    onPauseVideo={pauseVideo}
                />

                <div className={styles.footerButtons}>
                    <button onClick={handleCaptureTab}>캡처하기</button>
                    <button onClick={handleCaptureArea}>부분 캡처</button>
                    <button>요약하기</button>
                    <button>내보내기</button>
                </div>
            </div>

            {/* (3) Sidebar */}
            <div className={styles.section3}>
                <button className={styles.sidebarButton}>작성하기</button>
                <button className={styles.sidebarButton}>커뮤니티</button>
                <button className={styles.sidebarButton}>재생목록</button>
            </div>
        </div>
    );
}
