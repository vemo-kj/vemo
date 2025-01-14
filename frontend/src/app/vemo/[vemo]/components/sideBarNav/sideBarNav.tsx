'use client';

import { CreateMemosResponseDto } from '@/app/types/vemo.types';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import Community from '../community/Community';
import ExportButton from '../exportButton/ExportButton';
import PlayList from '../playList/PlayList';
import QuizView from '../quizView/QuizView';
import SummaryButton from '../summaryButton/SummaryButton';
import SummaryView from '../summaryView/SummaryView';
import styles from './sideBarNav.module.css';

export interface SideBarNavProps {
    selectedOption: string;
    onOptionSelect: (option: string) => void;
    renderSectionContent: () => React.ReactNode;
    currentTimestamp: string;
    handleCaptureTab: () => void;
    handleCaptureArea: () => void;
    editorRef: React.RefObject<any>;
    vemoData: CreateMemosResponseDto | null;
    videoId: string;
    memosId: number | null;
}


// 메모 생성 함수
export default function SidebarNav({
    selectedOption,
    onOptionSelect,
    renderSectionContent,
    currentTimestamp,
    handleCaptureTab,
    handleCaptureArea,
    editorRef,
    vemoData,
    videoId,
    memosId,
}: SideBarNavProps) {
    const [activeTab, setActiveTab] = useState('write');
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    // vemoData가 변경될 때마다 editedTitle 업데이트
    useEffect(() => {
        if (vemoData?.title) {
            setEditedTitle(vemoData.title);
        }
    }, [vemoData]);

    // videoId 값 확인
    console.log('sideBarNav.tsx props videoId:', videoId);

    // 메튼 클릭 핸들러

    const handleTitleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !memosId) {
                console.error('토큰 또는 memosId가 없습니다.');
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memos/${memosId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title: editedTitle }),
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('제목 수정에 실패했습니다.');
            }

            setIsEditingTitle(false);
        } catch (error) {
            console.error('제목 수정 중 오류 발생:', error);
            // 에러 발생 시 원래 제목으로 복원
            setEditedTitle(vemoData?.title || '');
        }
    };

    return (
        <div className={styles.container}>
            {/* 왼쪽 탭 버튼 영역 */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'write' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('write')}
                >
                    <div className={styles.iconButton}>
                        <Image
                            className={styles.defaultIcon}
                            src="/icons/bt_SideNav_Edit.svg"
                            alt="작성하기"
                            width={20}
                            height={20}
                        />
                        <span className={styles.iconButtonText}>작성하기</span>
                    </div>
                </button>

                <button
                    className={`${styles.tab} ${activeTab === 'community' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('community')}
                >
                    <div className={styles.iconButton}>
                        <Image
                            className={styles.defaultIcon}
                            src="/icons/bt_SideNav_Community.svg"
                            alt="커뮤니티"
                            width={20}
                            height={20}
                        />
                        <span className={styles.iconButtonText}>커뮤니티</span>
                    </div>
                </button>

                <button
                    className={`${styles.tab} ${activeTab === 'playlist' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('playlist')}
                >
                    <div className={styles.iconButton}>
                        <Image
                            className={styles.defaultIcon}
                            src="/icons/bt_SideNav_playerlist.svg"
                            alt="재생목록"
                            width={20}
                            height={20}
                        />
                        <span className={styles.iconButtonText}>재생목록</span>
                    </div>
                </button>
            </div>

            {/* 오른쪽 콘텐츠 영역 */}
            <div className={styles.tabContent}>
                {activeTab === 'write' && (
                    <>
                        <div className={styles.headerContainer}>
                            <div className={styles.titleContainer}>
                                {isEditingTitle ? (
                                    <input
                                        type="text"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        onBlur={handleTitleSave}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleTitleSave();
                                            }
                                        }}
                                        className={styles.titleInput}
                                        autoFocus
                                    />
                                ) : (
                                    <h1
                                        className={styles.notesHeaderText}
                                        onClick={() => {
                                            setIsEditingTitle(true);
                                            setEditedTitle(vemoData?.title || '');
                                        }}
                                    >
                                        {editedTitle || '제목 없음'}
                                    </h1>
                                )}
                            </div>

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
                            <SummaryView
                                onTimestampClick={timestamp => {
                                    const [minutes, seconds] = timestamp.split(':').map(Number);
                                    const timeInSeconds = minutes * 60 + seconds;
                                    const player = document.querySelector('iframe');
                                    if (player) {
                                        // @ts-ignore
                                        player.contentWindow.postMessage(
                                            JSON.stringify({
                                                event: 'command',
                                                func: 'seekTo',
                                                args: [timeInSeconds, true],
                                            }),
                                            '*',
                                        );
                                    }
                                }}
                            />
                        ) : selectedOption === '퀴즈 보기' ? (
                            <QuizView
                                onTimestampClick={timestamp => {
                                    const [minutes, seconds] = timestamp.split(':').map(Number);
                                    const timeInSeconds = minutes * 60 + seconds;
                                    const player = document.querySelector('iframe');
                                    if (player) {
                                        // @ts-ignore
                                        player.contentWindow.postMessage(
                                            JSON.stringify({
                                                event: 'command',
                                                func: 'seekTo',
                                                args: [timeInSeconds, true],
                                            }),
                                            '*',
                                        );
                                    }
                                }}
                            />
                        ) : (
                            renderSectionContent()
                        )}
                        {selectedOption === '내 메모 보기' && (
                            <div className={styles.footerButtons}>
                                <button onClick={handleCaptureTab} className={styles.iconButton}>
                                    <Image
                                        className={styles.defaultIcon}
                                        src="/icons/bt_edit_nav_capture.svg"
                                        alt="캡처"
                                        width={20}
                                        height={20}
                                    />
                                    <span className={styles.iconButtonText}>캡처하기</span>
                                </button>
                                <button onClick={handleCaptureArea} className={styles.iconButton}>
                                    <Image
                                        className={styles.defaultIcon}
                                        src="/icons/bt_edit_nav_partCapture.svg"
                                        alt="부분 캡처"
                                        width={20}
                                        height={20}
                                    />
                                    <span className={styles.iconButtonText}>부분캡처</span>
                                </button>

                                <SummaryButton videoId={videoId} />
                                {memosId && <ExportButton memosId={memosId} />}
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
