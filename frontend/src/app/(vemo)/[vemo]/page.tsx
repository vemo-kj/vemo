'use client';

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DropdownMenu from './components/DropdownMenu';

import SummaryButton from './components/summaryButton/SummaryButton';
import ExportButton from './components/exportButton/ExportButton';

import { SummaryProvider } from '../[vemo]/context/SummaryContext'

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


    return (
        <div className={styles.container}>

            {/* (1) 유튜브 영상 섹션. captureRef를 여기에 달면 전체가 캡처 대상 */}
            <div
                className={styles.section1}
                ref={captureRef}

                style={{ position: 'relative' }} // selection box를 absolute로 띄우려면 relative 부모가 필요
            >
                {/* 드래그 시 표시되는 "선택 영역 박스" */}

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
                    <p className={styles.noteTitle}>자바 스크립트 스터디1111</p>
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
                />

                <div className={styles.footerButtons}>
                    {/* 전체 캡처 */}

                    <button>캡처하기</button>
                    {/* <button onClick={}>캡처하기</button> */}

                    {/* 부분 캡처: 버튼 토글로 on/off */}
                    <button> 부분 캡처 </button>



                

                    <SummaryButton />

                </div>
            </div>

            {/* (3) Sidebar */}
            <div className={styles.section3}>
                <button className={styles.sidebarButton}>작성하기</button>
                <button className={styles.sidebarButton}>커뮤니티</button>
                <button className={styles.sidebarButton}>재생목록</button>
            </div>
        </div>

        </SummaryProvider>

    );
}
