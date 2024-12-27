'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DropdownMenu from './components/DropdownMenu';

// DraftEditor 동적 로드
// 클라이언트와 서버가 달라서 발생되는 에러를 막기 위해서 서버에서만 동작하고 나중에 값을 넘겨주기 위해
const EditorNoSSR = dynamic(() => import('./components/editor'), { ssr: false });

export default function VemoPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [selectedOption, setSelectedOption] = useState('내 메모 보기'); // 드롭다운에서 선택된 옵션 상태

    // 현재 재생 시간
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const playerRef = useRef<any>(null); // 유튜브 플레이어 참조

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option); // 선택된 옵션 값 업데이트
        console.log(`선택된 옵션: ${option}`);
    };

    // 유튜브 타임스탬프 구현
    // 유튜브 iFrame API 로드
    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                // 비디오 ID 향후 동적으로 할당
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
                <h1 className={styles.notesHeader}>나만의 노트</h1>
                <p className={styles.notesSubHeader}>자바 스크립트 스터디 재생목록</p>
                <div className={styles.notesContent}>
                    <p className={styles.noteTitle}>자바 스크립트 스터디</p>
                    <div className={styles.noteActions}>
                        {/* 드롭다운 버튼 */}
                        <div className={styles.dropdown}>
                            <DropdownMenu
                                options={['내 메모 보기', 'AI 요약 보기', '옵션 3']}
                                defaultOption={selectedOption}
                                onSelect={handleOptionSelect} // 선택된 옵션을 업데이트하는 함수 전달
                            />
                        </div>
                    </div>
                </div>
                {/* <p>현재 재생 시간: {currentTimestamp}</p> */}

                {/* 에디터 컴포넌트에 "현재 시간" 함수와 "타임스탬프 클릭" 함수를 넘김 */}
                <EditorNoSSR
                    getTimestamp={() => currentTimestamp}
                    onTimestampClick={handleSeekToTime}
                />
                <div className={styles.footerButtons}>
                    <button>캡처하기</button>
                    <button>부분캡처</button>
                    <button>요약하기</button>
                    <button>내보내기</button>
                </div>
            </div>
            {/* Section 3: Sidebar */}
            <div className={styles.section3}>
                <button className={styles.sidebarButton}>작성하기</button>
                <button className={styles.sidebarButton}>커뮤니티</button>
                <button className={styles.sidebarButton}>재생목록</button>
            </div>
        </div>
    );
}
