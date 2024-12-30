'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DropdownMenu from './components/DropdownMenu';
import DraftEditor from './components/editor/editor';

// 동적 로드된 DraftEditor
const EditorNoSSR = dynamic(() => import('./components/editor/editor'), { ssr: false });

export default function VemoPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    // (1) 유튜브 로직
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const playerRef = useRef<any>(null);

    const editorRef = useRef<any>(null);
    const captureRef = useRef<HTMLDivElement | null>(null);

    // (2) 캡처 상태 + 추가
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // [추가] 그리기 창 열림/닫힘
    const [isDrawingOpen, setIsDrawingOpen] = useState(false);

    useEffect(() => {
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

    // 1초마다 타임스탬프 갱신
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

    // (3) 드롭다운
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // (4) 시간 이동
    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    // (5) 캡처 함수
    const handleCaptureTab = () => {
        window.postMessage({ type: 'CAPTURE_TAB' }, '*');
    };
    const handleCaptureArea = () => {
        window.postMessage({ type: 'CAPTURE_AREA' }, '*');
    };

    // [추가] 메시지 수신 => capturedImage에 저장
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'CAPTURE_TAB_RESPONSE') {
                // 캡처된 이미지 + 타임스탬프를 메모 아이템으로 추가
                setCapturedImage(event.data.dataUrl);
                // [추가] 에디터에게 “바로 노트 아이템 추가” 지시 (timestamp, 이미지)
                editorRef.current?.addCaptureItem?.(currentTimestamp, event.data.dataUrl);
            } else if (event.data.type === 'CAPTURE_AREA_RESPONSE') {
                setCapturedImage(event.data.dataUrl);
                editorRef.current?.addCaptureItem?.(currentTimestamp, event.data.dataUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, [currentTimestamp]);

    // [추가] “그리기” 버튼 클릭 => 배경 오퍼시티 & 플레이어 정지
    const handleOpenDrawing = () => {
        if (playerRef.current?.pauseVideo) {
            playerRef.current.pauseVideo();
        }
        setIsDrawingOpen(true);
    };

    // [추가] 그리기 창이 닫혔을 때
    const handleCloseDrawing = () => {
        setIsDrawingOpen(false);
    };

    return (
        <div className={styles.container}>
            {/* (1) 유튜브 섹션 */}
            <div className={styles.section1} ref={captureRef} style={{ position: 'relative' }}>
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
                    capturedImage={null} // [중요] 지금은 “드로잉” 없이 바로 표시 안 함
                />

                <div className={styles.footerButtons}>
                    {/* 전체 캡처 / 부분 캡처 */}
                    <button onClick={handleCaptureTab}>캡처하기</button>
                    <button onClick={handleCaptureArea}>부분 캡처</button>
                    <button>요약하기</button>
                    <button>내보내기</button>
                </div>
            </div>

            {/* (3) 사이드바 */}
            <div className={styles.section3}>
                <button className={styles.sidebarButton}>작성하기</button>
                <button className={styles.sidebarButton}>커뮤니티</button>
                <button className={styles.sidebarButton}>재생목록</button>
            </div>

            {/* [추가] 그리기 (배경 오퍼시티 & 모달 형태) */}
            {isDrawingOpen && (
                <div className={styles.drawOverlay}>
                    <div className={styles.drawPopup}>
                        {/* <DrawingCanvas onClose={handleCloseDrawing} /> */}
                    </div>
                </div>
            )}
        </div>
    );
}
