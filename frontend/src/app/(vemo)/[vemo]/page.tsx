'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';

// DraftEditor 동적 로드
const EditorNoSSR = dynamic(() => import('./components/editor'), { ssr: false });

export default function VemoPage() {
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const playerRef = useRef<any>(null);

    // 유튜브 iFrame API 로드
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

    // 매초 재생 시간 업데이트
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

    // 타임스탬프 → 유튜브 플레이어로 이동
    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);

        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    return (
        <div className={styles.container}>
            {/* 유튜브 영상 */}
            <div className={styles.section1}>
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

            {/* 에디터 영역 */}
            <div className={styles.section2}>
                <p>현재 재생 시간: {currentTimestamp}</p>

                {/* 에디터 컴포넌트에 "현재 시간" 함수와 "타임스탬프 클릭" 함수를 넘김 */}
                <EditorNoSSR
                    getTimestamp={() => currentTimestamp}
                    onTimestampClick={handleSeekToTime}
                />
            </div>
        </div>
    );
}
