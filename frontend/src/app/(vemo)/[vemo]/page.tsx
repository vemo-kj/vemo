'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './Vemo.module.css';
import Editor from './components/editor';

export default function VemoPage() {
    const videoRef = useRef<HTMLIFrameElement>(null); // IFrame 참조를 위한 useRef

    useEffect(() => {
        if (videoRef.current) {
            console.log('IFrame is loaded', videoRef.current);
        }
    }, []);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    // 드롭다운 열기/닫기 토글
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // 항목 선택
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
                        ref={videoRef} // IFrame에 대한 참조
                        src="https://www.youtube.com/embed/example"
                        title="Video Player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.video}
                    ></iframe>
                    <p className={styles.videoTitle}></p>
                </div>
            </div>

            {/* Section 2: Notes */}
            <div className={styles.section2}>
                <h2 className={styles.notesHeader}>나만의 노트</h2>
                <p className={styles.notesSubHeader}>자바 스크립트 스터디 재생목록</p>
                <div className={styles.notesContent}>
                    <p className={styles.noteTitle}>자바 스크립트 스터디</p>
                    <div className={styles.noteActions}>
                        {/* 드롭다운 버튼 */}
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

                <div className={styles.textInput}>
                    <Editor />
                </div>
                <div className={styles.footerButtons}>
                    <button>편집하기</button>
                    <button>부분편집</button>
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
