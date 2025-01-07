'use client';

import React, { useState } from 'react';
import Community from '../community/Community';
import ExportButton from '../exportButton/ExportButton';
import PlayList from '../playList/PlayList';
import QuizView from '../quizView/QuizView';
import SummaryButton from '../summaryButton/SummaryButton';
import SummaryView from '../summaryView/SummaryView';
import styles from './sideBarNav.module.css';
import { CreateMemosResponseDto } from '@/app/types/vemo.types';

interface SideBarNavProps {
    selectedOption: string;
    onOptionSelect: (option: string) => void;
    renderSectionContent: () => React.ReactNode;
    currentTimestamp: string;
    handleCaptureTab: () => void;
    handleCaptureArea: () => void;
    editorRef: React.RefObject<any>;
    vemoData: CreateMemosResponseDto | null;
}

export default function SidebarNav({
    selectedOption,
    onOptionSelect,
    renderSectionContent,
    currentTimestamp,
    handleCaptureTab,
    handleCaptureArea,
    editorRef,
    vemoData,
}: SideBarNavProps) {
    const [activeTab, setActiveTab] = useState('write'); // 현재 활성화된 탭 상태 관리

    return (
        <div className={styles.container}>
            {/* 왼쪽 탭 버튼 영역 */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'write' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('write')}
                >
                    작성하기
                </button>

                <button
                    className={`${styles.tab} ${activeTab === 'community' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('community')}
                >
                    커뮤니티
                </button>

                <button
                    className={`${styles.tab} ${activeTab === 'playlist' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('playlist')}
                >
                    재생목록
                </button>
            </div>

            {/* 탭 내용 표시 영역 */}
            <div className={styles.tabContent}>
                {activeTab === 'write' && (
                    <>
                        <h1 className={styles.notesHeader}>나만의 노트</h1>

                        {/* 재생목록 이름이 들어감 */}
                        <p className={styles.notesSubHeader}>자바 스크립트 스터디 재생목록</p>
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
                                <SummaryView videoId={vemoData?.videoId ?? ''} />
                            ) : selectedOption === '퀴즈 보기' ? (
                                <QuizView />
                            ) : (
                                renderSectionContent()
                            )}
                        </div>
                        {selectedOption === '내 메모 보기' && (
                            <div className={styles.footerButtons}>
                                <button onClick={handleCaptureTab}>캡처하기</button>
                                <button onClick={handleCaptureArea}>부분 캡처</button>
                            </div>
                        )}
                        <div className={styles.footerButtons}>
                            <SummaryButton />
                            <ExportButton />
                            <button>저장하기</button>
                        </div>
                    </>
                )}

                {activeTab === 'community' && <Community />}
                {activeTab === 'playlist' && <PlayList />}
            </div>
        </div>
    );
}
