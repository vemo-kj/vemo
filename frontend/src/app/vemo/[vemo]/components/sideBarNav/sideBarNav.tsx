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

/**
 * ----------------------------------------------------------------
 * 📌 SidebarNavProps
 * - 사이드바 탭 전환, 캡처하기, 부분캡처 등 props 정의
 * ----------------------------------------------------------------
 */
interface SidebarNavProps {
    selectedOption: string;
    onOptionSelect: (option: string) => void;
    renderSectionContent: () => React.ReactNode;
    currentTimestamp: string;
    handleCaptureTab: () => void;
    handleCaptureArea: () => void;
    editorRef: React.RefObject<any>;
    playlistData?: {
        playlist: {
            id: number;
            name: string;
        };
        memos: {
            title: string;
        };
    };
    memosId?: string;
}

/**
 * ----------------------------------------------------------------
 * 📌 SidebarNav 컴포넌트
 * - 좌측(또는 우측)에 위치하는 사이드 탭(작성하기, 커뮤니티, 재생목록)
 * - '나만의 노트' 섹션에서 작성 시 DraftEditor가 렌더링됨
 * ----------------------------------------------------------------
 */
/**
 * ----------------------------------------------------------------
 * 📌 SidebarNav 컴포넌트
 * - 좌측(또는 우측)에 위치하는 사이드 탭(작성하기, 커뮤니티, 재생목록)
 * - '나만의 노트' 섹션에서 작성 시 DraftEditor가 렌더링됨
 * ----------------------------------------------------------------
 */
export default function SidebarNav({
    selectedOption,
    onOptionSelect,
    renderSectionContent,
    currentTimestamp,
    handleCaptureTab,
    handleCaptureArea,
    editorRef,
    playlistData,
    memosId,
}: SidebarNavProps) {
    // 탭 상태: 'write' | 'community' | 'playlist'
    const [activeTab, setActiveTab] = useState('write');

    return (
        <div className={styles.container}>
            {/* (1) 상단 탭 메뉴 */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${styles.mainTab} ${
                        activeTab === 'write' ? styles.activeTab : ''
                    }`}
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
                    className={`${styles.tab} ${styles.mainTab} ${
                        activeTab === 'community' ? styles.activeTab : ''
                    }`}
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
                    className={`${styles.tab} ${styles.mainTab} ${
                        activeTab === 'playlist' ? styles.activeTab : ''
                    }`}
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

            {/* (2) 탭 별 콘텐츠 영역 */}
            <div className={styles.tabContent}>
                {/* 작성하기 탭 */}
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
                                {/* 드롭다운: "내 메모 보기" / "AI 요약 보기" / "퀴즈 보기" */}
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

                            {/* 드롭다운 선택에 따라 다른 컴포넌트 렌더링 */}
                            {selectedOption === 'AI 요약 보기' ? (
                                <SummaryView />
                            ) : selectedOption === '퀴즈 보기' ? (
                                <QuizView />
                            ) : (
                                renderSectionContent()
                            )}
                        </div>

                        {/* "내 메모 보기" 상태일 때만 하단 버튼 활성화 */}
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
                        <div className={styles.footerButtons}>
                            <SummaryButton />
                            <ExportButton />
                            <button>저장하기</button>
                        </div>
          </>
        )}

                {/* 커뮤니티 탭 */}
                {activeTab === 'community' && <Community />}

                {/* 재생목록 탭 */}
                {activeTab === 'playlist' && <PlayList />}
            </div>
        </div>
    );
}
