'use client'

import React, { useState } from 'react';
import styles from './sideBarNav.module.css'
import SummaryButton from '../summaryButton/SummaryButton'
import ExportButton from '../exportButton/ExportButton';
import { useSummary } from '../../context/SummaryContext';
import Community from '../community/Community';

interface SidebarNavProps {
    selectedOption: string;
    onOptionSelect: (option: string) => void;
    renderSectionContent: () => React.ReactNode;
    currentTimestamp: string;
}

export default function SidebarNav({ selectedOption, onOptionSelect, renderSectionContent, currentTimestamp }: SidebarNavProps) {
    const [activeTab, setActiveTab] = useState('write');

    return (
        <div className={styles.section2}>
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
            <div className={styles.tabContent}>
                {activeTab === 'write' && (
                    <>
                        <h1 className={styles.notesHeader}>나만의 노트</h1>
                        <p className={styles.notesSubHeader}>자바 스크립트 스터디 재생목록</p>
                        <div className={styles.notesContent}>
                            <div className={styles.noteActions}>
                                <div className={styles.dropdown}>
                                    <select 
                                        value={selectedOption} 
                                        onChange={(e) => onOptionSelect(e.target.value)}
                                        className={styles.dropdownSelect}
                                    >
                                        <option value="내 메모 보기">내 메모 보기</option>
                                        <option value="AI 요약 보기">AI 요약 보기</option>
                                        <option value="옵션 3">옵션 3</option>
                                    </select>
                                </div>
                            </div>
                            {renderSectionContent()}
                        </div>
                        {selectedOption === '내 메모 보기' && (
                            <div className={styles.footerButtons}>
                                <button className={styles.footerButton}>캡처하기</button>
                                <button className={styles.footerButton}>부분 캡처</button>
                                <SummaryButton />
                                <ExportButton />
                            </div>
                        )}
                    </>
                )}
                {activeTab === 'community' && (
                    <Community />
                )}
                {activeTab === 'playlist' && (
                    <div className={styles.playlistContent}>
                        <h2 className={styles.notesHeader}>재생목록</h2>
                        {/* 재생목록 내용을 여기에 추가하세요 */}
                    </div>
                )}
            </div>
        </div>
    );
}

