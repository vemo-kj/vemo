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
import Image from 'next/image';

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

// 응답 타입
interface MemosidResponse {
    id: number; // memosid
    title: string; // 메모 제목
    createdAt: Date; // 메모 생성 시간
}

interface Memo {
    id: number;
    timestamp: string;
    description: string;
}

interface Captures {
    id: number;
    createdAt: Date;
    imageUrl: string;
}

interface MemoListResponse {
    id: number;
    title: string;
    createdAt: Date;
    memo: Memo[];
    captures: Captures[];
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
}: SideBarNavProps) {
    const [activeTab, setActiveTab] = useState('write');
    const [memosId, setMemosId] = useState<number | null>(null);

    // 토큰 가져오기
    const token = sessionStorage.getItem('token');
    // videoId 값 확인
    console.log('sideBarNav.tsx props videoId:', videoId);

    // 메모 생성 API 호출 함수
    const createMemo = async (videoId: string): Promise<MemosidResponse> => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/home/memos/${videoId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                },
            );

            const data = await response.json();
            setMemosId(data.id);
            console.log('생성된 메모 ID:', data.id);

            if (!response.ok) {
                throw new Error('Failed to create memo');
            }

            return data;
        } catch (error) {
            console.error('Error creating memo:', error);
            throw error;
        }
    };

    const getMemosById = async (memosId: string): Promise<MemoListResponse> => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/memos/${memosId}`, {
                method: 'Get',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                credentials: 'include',
            });

            const data = await response.json();
            setMemosId(data.id);
            console.log('생성된 메모 ID:', data);

            if (!response.ok) {
                throw new Error('Failed to create memo');
            }

            return data;
        } catch (error) {
            console.error('Error creating memo:', error);
            throw error;
        }
    };

    // 버튼 클릭 핸들러
    const handleWriteClick = async () => {
        try {
            console.log('handleWriteClick memosId: 111111111111', memosId); // 클릭 시점의 memosId 값 확인

            if (!videoId) {
                console.error('No videoId available');
                return;
            }
            console.log('handleWriteClick videoId:', videoId); // 클릭 시점의 videoId 값 확인
            
        } catch (error) {
            console.error('Failed to create memo:', error);
        }
    };

    return (
        <div className={styles.container}>
            {/* 왼쪽 탭 버튼 영역 */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'write' ? styles.activeTab : ''}`}
                    onClick={() => {
                        setActiveTab('write');
                        handleWriteClick();
                    }}
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
                                <p className={styles.notesSubHeader}>
                                    자바 스크립트 스터디 재생목록
                                </p>
                                <h1 className={styles.notesHeaderText}>자바 스크립트 스터디</h1>
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
