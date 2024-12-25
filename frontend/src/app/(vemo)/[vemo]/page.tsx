'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // Next.js의 Link 컴포넌트 가져오기
import styles from './Vemo.module.css';

export default function VemoPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    // 드롭다운 열기/닫기 토글
    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    // 항목 선택
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
        setIsDropdownOpen(false); // 드롭다운 닫기
    };

    return (
        <div className={styles.container}>
            {/* Section 1: Video */}
            <div className={styles.section1}>
                {/* 로고 버튼 */}
                <Link href="/" passHref>
                    <img
                        src="/icons/Button_home.svg" // 로고 이미지 경로
                        alt="VEMO logo"
                        className={styles.logoButton}
                    />
                </Link>
                <div className={styles.videoWrapper}>
                    <iframe
                        src="https://www.youtube.com/embed/K1kt8VHX9eI" // watch 대신 embed 사용
                        title="Video Player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className={styles.video}
                    ></iframe>
                    {/* <p className={styles.videoTitle}>
                        This is where the title can go for your video
                    </p> */}
                </div>
            </div>

            {/* Section 2: Notes */}
            <div className={styles.section2}>
                <h1 className={styles.notesHeader}>나만의 노트</h1>
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
                    <div className={styles.textInput}>
                        <textarea
                            className={styles.textArea}
                            placeholder="내용을 입력하세요..."
                        ></textarea>
                        <div className={styles.textToolbar}>
                            <button>B</button>
                            <button>I</button>
                            <button>U</button>
                            <button>{`< >`}</button>
                        </div>
                    </div>
                </div>
                <div className={styles.footerButtons}>
                    <button>캡처하기</button>
                    <button>부분캡처</button>
                    <button>요약하기</button>
                    <button>내보내기</button>
                </div>
            </div>

            {/* Section 3: SideNav */}
            <div className={styles.section3}>
                <button className={styles.sidebarButton}>작성하기</button>
                <button className={styles.sidebarButton}>커뮤니티</button>
                <button className={styles.sidebarButton}>재생목록</button>
            </div>
        </div>
    );
}
