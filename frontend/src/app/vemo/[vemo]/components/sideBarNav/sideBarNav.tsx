// src/app/vemo/[vemo]/components/sideBarNav/sideBarNav.tsx

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
// [추가] html-to-image 모듈 (npm i html-to-image)

import { captureService } from '@/app/api/captureService';
// import EditorNoSSR from '../editor/EditorNoSSR';

interface SidebarNavProps {
    selectedOption: string;
    onOptionSelect: (option: string) => void;
    renderSectionContent: () => React.ReactNode;
    currentTimestamp: string;
    handleCaptureTab: () => void;          // (기존) 부모 props
    handleCaptureArea?: () => void;       // (기존) 부모 props
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
    memosId: number;
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
    handleCaptureTab: handleCaptureTabProp,
    handleCaptureArea,
    editorRef,
    playlistData,
    memosId,
}: SidebarNavProps) {
    const [activeTab, setActiveTab] = useState('write');

    // [수정] toPng를 사용하기 위해 내부에서 handleCaptureTabInternal 구현
    const handleCaptureTabInternal = async () => {
        try {
            if (!editorRef?.current) {
                console.error('Editor reference is missing');
                alert('에디터 참조가 누락되었습니다.');
                return;
            }

            console.log('[Vemo] 전체 캡처 시작');
            // 크롬 확장프로그램으로 메시지 전송
            window.postMessage({ type: 'CAPTURE_TAB' }, '*');

            // 크롬 확장프로그램으로부터의 응답 대기
            window.addEventListener('message', async function responseHandler(event) {
                if (event.data.type === 'CAPTURE_TAB_RESPONSE') {
                    try {
                        console.log('[Vemo] 캡처 이미지 수신');
                        
                        // 서버에 전송
                        const response = await captureService.createCapture({
                            timestamp: currentTimestamp,
                            image: event.data.dataUrl,
                            memosId: memosId
                        });
                        
                        // 에디터에 캡처 아이템 추가
                        if (response && editorRef.current) {
                            editorRef.current.addCaptureItem(currentTimestamp, event.data.dataUrl);
                        }
                    } catch (error) {
                        console.error('[Vemo] 캡처 처리 중 에러:', error);
                        alert('캡처 저장 중 오류가 발생했습니다. 이미지 크기가 너무 클 수 있습니다.');
                    } finally {
                        window.removeEventListener('message', responseHandler);
                    }
                }
            });
        } catch (error) {
            console.error('[Vemo] 캡처 실패:', error);
            alert('캡처에 실패했습니다.');
        }
    };

    // [수정] 부분 캡처 (예시)
    const handleCaptureAreaInternal = async () => {
        try {
            if (!editorRef?.current) {
                console.error('Editor reference is missing');
                alert('에디터 참조가 누락되었습니다.');
                return;
            }

            console.log('[Vemo] 부분 캡처 시작');
            // 크롬 확장프로그램으로 메시지 전송
            window.postMessage({ type: 'CAPTURE_AREA' }, '*');

            // 크롬 확장프로그램으로부터의 응답 대기
            window.addEventListener('message', async function responseHandler(event) {
                if (event.data.type === 'CAPTURE_TAB_RESPONSE') {
                    console.log('[Vemo] 부분 캡처 이미지 수신:', event.data.dataUrl.substring(0, 100) + '...');
                    
                    // 서버에 전송
                    const response = await captureService.createCapture({
                        timestamp: currentTimestamp,
                        image: event.data.dataUrl,
                        memosId: memosId
                    });

                    console.log('[Vemo] 서버 응답:', response);

                    // 에디터에 캡처 아이템 추가
                    if (response && editorRef.current) {
                        editorRef.current.addCaptureItem(currentTimestamp, event.data.dataUrl);
                    }

                    // 이벤트 리스너 제거
                    window.removeEventListener('message', responseHandler);
                }
            });
        } catch (error) {
            console.error('[Vemo] 부분 캡처 실패:', error);
            alert('부분 캡처에 실패했습니다.');
        }
    };

    return (
        <div className={styles.container}>
            {/* 탭 버튼 */}
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

            {/* 탭 내용 */}
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

                            {/* 여기서 renderSectionContent()가 실제 메모 에디터 등 렌더 */}
                            {selectedOption === 'AI 요약 보기' ? (
                                <SummaryView />
                            ) : selectedOption === '퀴즈 보기' ? (
                                <QuizView />
                            ) : (
                                renderSectionContent()
                            )}
                        </div>

                        {/* "내 메모 보기"일 때만 하단 버튼 */}
                        {selectedOption === '내 메모 보기' && (
                            <div className={styles.footerButtonContainer}>
                                <button onClick={handleCaptureTabInternal} className={styles.iconButton}>
                                    <Image
                                        src="/icons/bt_edit_nav_capture.svg"
                                        alt="캡처"
                                        width={20}
                                        height={20}
                                    />
                                    <span className={styles.iconButtonText}>캡처하기</span>
                                </button>
                                <button onClick={handleCaptureAreaInternal} className={styles.iconButton}>
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