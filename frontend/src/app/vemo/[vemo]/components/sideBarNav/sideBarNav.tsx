'use client';

import React, { useState } from 'react';
import Community from '../community/Community';
import ExportButton from '../exportButton/ExportButton';
import PlayList from '../playList/PlayList';
import QuizView from '../quizView/QuizView';
import SummaryButton from '../summaryButton/SummaryButton';
import SummaryView from '../summaryView/SummaryView';
import styles from './sideBarNav.module.css';
import Image from 'next/image';

interface SidebarNavProps {
    selectedOption: string;
    onOptionSelect: (option: string) => void;
    renderSectionContent: () => React.ReactNode;
    currentTimestamp: string;

    handleCaptureTab: () => void; // 캡처하기 함수 추가
    handleCaptureArea: () => void; // 부분 캡처하기 함수 추가
    editorRef: React.RefObject<any>; // 에디터 참조 추가
    playlistData?: {
        playlist: {
            id: number;
            name: string;
        };
        memos: {
            title: string;
            // 필요한 경우 다른 비디오 정보도 추가
        };
    };
}

export default function SidebarNav({
    selectedOption,
    onOptionSelect,
    renderSectionContent,
    currentTimestamp,
    handleCaptureTab,
    handleCaptureArea,
    editorRef,
    playlistData,
}: SidebarNavProps) {
    const [activeTab, setActiveTab] = useState('write'); // 현재 활성화된 탭 상태 관리

    return (
        <div className={styles.container}>
            {/* 왼쪽 탭 버튼 영역 */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${styles.mainTab} ${activeTab === 'write' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('write')}
                >
                    <div className={styles.iconButton}>
                        <Image
                            src="/icons/bt_SideNav_Edit.svg"
                            alt="작성하기"
                            width={20}
                            height={20}
                        />
                        <span className={styles.iconButtonText}>작성하기</span>
                    </div>
                </button>

                <button
                    className={`${styles.tab} ${styles.mainTab} ${activeTab === 'community' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('community')}
                >
                    <div className={styles.iconButton}>
                        <Image
                            src="/icons/bt_SideNav_Community.svg"
                            alt="커뮤니티"
                            width={20}
                            height={20}
                        />
                        <span className={styles.iconButtonText}>커뮤니티</span>
                    </div>
                </button>

                <button
                    className={`${styles.tab} ${styles.mainTab} ${activeTab === 'playlist' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('playlist')}
                >
                    <div className={styles.iconButton}>
                        <Image
                            src="/icons/bt_SideNav_playerlist.svg"
                            alt="재생목록"
                            width={20}
                            height={20}
                        />
                        <span className={styles.iconButtonText}>재생목록</span>
                    </div>
                </button>
            </div>

            {/* 탭 내용 표시 영역 */}
            <div className={styles.tabContent}>
                {activeTab === 'write' && (
                    <>
                        <h1 className={styles.notesHeader}>나만의 노트</h1>
                        <div className={styles.contentWrapper}>
                            <p className={styles.playlistTitle}>
                                {playlistData?.playlist.name || '재생목록 이름 없음'}
                            </p>
                            <h2 className={styles.videoTitle}>
                                {playlistData?.memos.title || '비디오 제목 없음'}
                            </h2>
                        </div>
                        <div className={styles.notesContent}>
                            <div className={styles.noteActions}>
                                <div className={styles.dropdown}>
                                    <select
                                        value={selectedOption}
                                        onChange={e => onOptionSelect(e.target.value)}
                                        className={styles.dropdownSelect}
                                    >
                                        <option value="내 메모 보기">내 메모 보기</option>
                                        <option value="AI 요약 보기">AI 요약 보기</option>
                                        <option value="퀴즈 보기">퀴즈 보기</option>
                                    </select>
                                </div>
                            </div>
                            {selectedOption === 'AI 요약 보기' ? (
                                <SummaryView />
                            ) : selectedOption === '퀴즈 보기' ? (
                                <QuizView />
                            ) : (
                                renderSectionContent()
                            )}
                        </div>
                        {selectedOption === '내 메모 보기' && (
                            <div className={styles.footerButtonContainer}>
                                <button onClick={handleCaptureTab} className={styles.iconButton}>
                                    <Image
                                        src="/icons/bt_edit_nav_capture.svg"
                                        alt="캡처"
                                        width={20}
                                        height={20}
                                    />
                                    <span className={styles.iconButtonText}>캡처하기</span>
                                </button>
                                <button onClick={handleCaptureArea} className={styles.iconButton}>
                                    <Image
                                        src="/icons/bt_edit_nav_partCapture.svg"
                                        alt="부분 캡처"
                                        width={20}
                                        height={20}
                                    />
                                    <span className={styles.iconButtonText}>부분캡처</span>
                                </button>
                                    <SummaryButton />
                                    <ExportButton />
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'community' && <Community />}
                {activeTab === 'playlist' && <PlayList />}
            </div>
        </div>
    );
}
