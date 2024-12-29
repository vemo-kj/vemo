'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styles from './Vemo.module.css';
import DropdownMenu from './components/DropdownMenu';
import SummaryButton from './components/summaryButton/SummaryButton';
import ExportButton from './components/exportButton/ExportButton';
import { SummaryProvider } from '../[vemo]/context/SummaryContext';
import SideBarNav from './components/sideBarNav/sideBarNav';


// 동적 로드된 DraftEditor
const EditorNoSSR = dynamic(() => import('./components/editor'), { ssr: false });

export default function VemoPage() {
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00'); // 현재 재생 시간
    const playerRef = useRef<any>(null);
    const editorRef = useRef<any>(null);
    const captureRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: 'pEt89CrE-6A',
                events: { onReady: () => console.log('Player ready') },
            });
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                const sec = playerRef.current.getCurrentTime();
                const mm = Math.floor(sec / 60);
                const ss = Math.floor(sec % 60);
                setCurrentTimestamp(`${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    const renderSectionContent = () => {
        switch (selectedOption) {
            case '내 메모 보기':
                return (
                    <>
                        <p className={styles.noteTitle}>내 메모 내용을 여기에 표시</p>
                        <EditorNoSSR
                            ref={editorRef}
                            getTimestamp={() => currentTimestamp}
                            onTimestampClick={(timestamp) => {
                                const [m, s] = timestamp.split(':').map(Number);
                                const total = (m || 0) * 60 + (s || 0);
                                playerRef.current?.seekTo(total, true);
                            }}
                        />
                    </>
                );
            case 'AI 요약 보기':
                return <p className={styles.noteTitle}>AI 요약 내용을 여기에 표시</p>;
            case '옵션 3':
                return <p className={styles.noteTitle}>옵션 3의 내용을 여기에 표시</p>;
            default:
                return <p className={styles.noteTitle}>기본 내용을 여기에 표시</p>;
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.section1} ref={captureRef} style={{ position: 'relative' }}>
                <Link href="/" passHref>
                    <img src="/icons/Button_home.svg" alt="VEMO logo" className={styles.logoButton} />
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
            <SummaryProvider>
                <SideBarNav
                    selectedOption={selectedOption}
                    onOptionSelect={handleOptionSelect}
                    renderSectionContent={renderSectionContent}
                    currentTimestamp={currentTimestamp}
                />
            </SummaryProvider>
        </div>
    );
}