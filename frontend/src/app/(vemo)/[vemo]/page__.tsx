'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DraftEditor from './components/editor/editor';
// DraftEditor를 동적 로드
const EditorNoSSR = dynamic(() => import('./components/editor/editor'), {
    ssr: false,
});

export default function VemoPage() {
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    const playerRef = useRef<any>(null);
    // 유튜브 현재 시각
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    // 캡처된 이미지
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    useEffect(() => {
        // 예: 유튜브 API 로드
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

    // 1초마다 timestamp 갱신
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

    // (1) “전체화면 캡처” 클릭
    const handleCaptureTab = () => {
        window.postMessage({ type: 'CAPTURE_TAB' }, '*');
    };

    // (2) “부분 캡처” 클릭
    const handleCaptureArea = () => {
        window.postMessage({ type: 'CAPTURE_AREA' }, '*');
    };

    // 드롭다운 핸들
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // (3) 메시지 수신 → capturedImage에 저장
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'CAPTURE_TAB_RESPONSE') {
                setCapturedImage(event.data.dataUrl);
            } else if (event.data.type === 'CAPTURE_AREA_RESPONSE') {
                setCapturedImage(event.data.dataUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // 노트 클릭 → 해당 시간으로 이동
    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    return (
        <div className={styles.container}>
            {/* 유튜브 영역 */}
            <div className={styles.videoSection}>
                <div className={styles.videoWrapper}>
                    <iframe
                        id="youtube-player"
                        src="https://www.youtube.com/embed/pEt89CrE-6A?enablejsapi=1"
                        title="YouTube Video Player"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <button onClick={handleCaptureTab}>전체화면 캡처</button>
                    <button onClick={handleCaptureArea}>부분 캡처</button>
                </div>
            </div>

            {/* 에디터 (노트) 영역 */}
            <div className={styles.editorSection}>
                <EditorNoSSR
                    getTimestamp={() => currentTimestamp}
                    onTimestampClick={handleSeekToTime}
                    capturedImage={capturedImage}
                />
            </div>
        </div>
    );
}
