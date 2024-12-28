'use client';

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DropdownMenu from './components/DropdownMenu';

// 동적 로드된 DraftEditor
const EditorNoSSR = dynamic(() => import('./components/editor'), { ssr: false });

export default function VemoPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    // 현재 재생 시간
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const playerRef = useRef<any>(null); // 유튜브 플레이어 참조

    // 에디터 참조
    const editorRef = useRef<any>(null);

    // **캡처 대상**: 유튜브 영상 포함 전체 섹션
    const captureRef = useRef<HTMLDivElement | null>(null);

    // [추가] 캡처된 이미지 URL 상태
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    // ================== 유튜브 로직 ================== //
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: 'pEt89CrE-6A',
                events: {
                    onReady: () => {
                        console.log('Player ready');
                    },
                },
            });
        };
    }, []);

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

    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    // 드롭다운 핸들
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // [추가] 캡처/부분캡처 버튼 클릭 시 message 보내기
    const handleCaptureTab = () => {
        window.postMessage({ type: 'CAPTURE_TAB' }, '*');
    };

    const handleCaptureArea = () => {
        window.postMessage({ type: 'CAPTURE_AREA' }, '*');
    };

    // [추가] 캡처 메시지 수신
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            // 캡처 응답에 따라 dataUrl을 setCapturedImage에 저장
            if (event.data.type === 'CAPTURE_TAB_RESPONSE') {
                setCapturedImage(event.data.dataUrl);
            } else if (event.data.type === 'CAPTURE_AREA_RESPONSE') {
                setCapturedImage(event.data.dataUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, []);

    return (
        <div className={styles.container}>
            {/* (1) 유튜브 영상 섹션. captureRef를 여기에 달면 전체가 캡처 대상 */}
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

                {/* [중요] Editor에 capturedImage를 props로 전달 */}
                <EditorNoSSR
                    ref={editorRef}
                    getTimestamp={() => currentTimestamp}
                    onTimestampClick={handleSeekToTime}
                    capturedImage={capturedImage}
                />

                <div className={styles.footerButtons}>
                    {/* 전체 캡처 */}
                    <button onClick={handleCaptureTab}>캡처하기</button>

                    {/* 부분 캡처 */}
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
