'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Vemo.module.css';
import dynamic from 'next/dynamic';

// [변경 전] import DraftEditor from './components/editor';
// [변경 후] DraftEditor를 동적으로 import (ssr: false)
//           1) 컴포넌트 이름을 대문자로 시작 (EditorNoSSR)
//           2) ssr: false 옵션으로 서버 사이드 렌더링 비활성화
const EditorNoSSR = dynamic(() => import('./components/editor'), {
    ssr: false,
});

export default function VemoPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00'); // 타임스탬프 상태
    const playerRef = useRef<any>(null); // YouTube Player Ref

    useEffect(() => {
        // YouTube IFrame API를 로드
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: 'pEt89CrE-6A', // YouTube 비디오 ID
                events: {
                    onReady: () => {
                        console.log('YouTube Player Ready');
                    },
                },
            });
        };
    }, []);

    useEffect(() => {
        // 1초마다 현재 재생 시간 업데이트
        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                const time = playerRef.current.getCurrentTime(); // 현재 재생 시간(초)
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                setCurrentTimestamp(
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                );
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // 드롭다운 열기/닫기
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // 옵션 선택
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        setIsDropdownOpen(false);
    };

    return (
        <div className={styles.container}>
            {/* Section 1: Video */}
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
                        // JS API를 사용하기 위해 ?enablejsapi=1 파라미터가 필요합니다.
                        src="https://www.youtube.com/embed/pEt89CrE-6A?enablejsapi=1"
                        title="YouTube Video Player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>

            {/* Section 2: Notes */}
            <div className={styles.section2}>
                <h2 className={styles.notesHeader}>나만의 노트</h2>
                <p className={styles.notesSubHeader}>자바 스크립트 스터디 재생목록</p>

                <div className={styles.notesContent}>
                    <p className={styles.noteTitle}>자바 스크립트 스터디</p>
                    {/* 여기에서 현재 재생 시간 확인 */}
                    <p>현재 재생 시간: {currentTimestamp}</p>
                    <div className={styles.noteActions}>
                        <div className={styles.dropdown}>
                            <button className={styles.noteDropdown} onClick={toggleDropdown}>
                                {selectedOption} ▼
                            </button>
                            {isDropdownOpen && (
                                <ul className={styles.dropdownMenu}>
                                    <li onClick={() => handleOptionSelect('옵션 1')}>옵션 1</li>
                                    <li onClick={() => handleOptionSelect('옵션 2')}>옵션 2</li>
                                    <li onClick={() => handleOptionSelect('옵션 3')}>옵션 3</li>
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* [변경 전] <editorNoSSR getTimestamp={() => currentTimestamp} /> 
                    [변경 후] 컴포넌트 이름을 대문자로: <EditorNoSSR ... />
                */}
                <div className={styles.textInput}>
                    <EditorNoSSR getTimestamp={() => currentTimestamp} />
                </div>
            </div>
        </div>
    );
}
