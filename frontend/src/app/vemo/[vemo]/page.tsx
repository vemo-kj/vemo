'use client';

import { createMemos } from '@/app/api/memoService';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Vemo.module.css';
import SideBarNav from './components/sideBarNav/sideBarNav';
import { SummaryProvider } from './context/SummaryContext';

/**
 * ----------------------------------------------------------------
 * 📌 memoService (fetch 사용)
 * ----------------------------------------------------------------
 * - 비디오 별 메모 컨테이너(memos)를 생성(POST)하거나
 *   추후 필요한 경우 GET, PUT, DELETE 등으로 확장 가능
 * - 예: /api/memos 엔드포인트에 요청을 보내 메모 컨테이너 생성
 * ----------------------------------------------------------------
 */

const API_URL = 'http://localhost:5050'; // 백엔드 서버 주소

// ----------------------------------------------------------------
// 📌 동적 로드(Dynamic Import)로 에디터 컴포넌트를 가져옴
// ----------------------------------------------------------------
const EditorNoSSR = dynamic<CustomEditorProps>(() => import('./components/editor/editor'), {
  ssr: false,
});

// ----------------------------------------------------------------
// 📌 Editor 컴포넌트에 넘길 Props 인터페이스
// ----------------------------------------------------------------
interface CustomEditorProps {
    ref?: React.Ref<unknown>;
    getTimestamp: () => string;
    onTimestampClick: (timestamp: string) => void;
    isEditable?: boolean;
    editingItemId?: string | null;
    onEditStart?: (itemId: string) => void;
    onEditEnd?: () => void;
    memosId: number;
}

// 페이지 컴포넌트의 props 타입 정의 추가
interface PageProps {
  params: {
    vemo: string;
  };
}

// ----------------------------------------------------------------
// 📌 VemoPage 컴포넌트 (주요 로직)
// ----------------------------------------------------------------
export default function VemoPage({ params: pageParams }: PageProps) {
    // params를 React.use()로 unwrap
    // params를 useParams로 가져옴
    const params = useParams();
    const vemo = params.vemo as string;
    const editorRef = useRef(null);
    const [memosId, setMemosId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const initializeMemos = async () => {
            if (!vemo) return;

            try {
                console.log('Creating memos for video:', vemo);
                // createMemos가 성공하면 생성된 memos.id를 반환 (memoService에서 return data.id)
                const newMemosId = await createMemos(vemo);
                if (newMemosId) {
                    setMemosId(newMemosId);
                    console.log('Successfully set memosId:', newMemosId);
                }
            } catch (error) {
                console.error('Failed to initialize memos:', error);
            }
        };

        initializeMemos();
    }, [vemo]);

    // (캡처) 메시지 수신 → editorRef.current?.addCaptureItem
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data.type === 'CAPTURE_TAB_RESPONSE') {
                editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
            } else if (e.data.type === 'CAPTURE_AREA_RESPONSE') {
                editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [currentTimestamp]);

    // 전체/부분 캡처
    const handleCaptureTab = () => {
        window.postMessage({ type: 'CAPTURE_TAB' }, '*');
    };
    // 부분 캡처
    const handleCaptureArea = () => {
        window.postMessage({ type: 'CAPTURE_AREA' }, '*');
    };
    // 캡처 기능 끝

    // 섹션 내용 렌더링
    const renderSectionContent = () => {
        switch (selectedOption) {
            case '내 메모 보기':
                return (
                    <>
                        <p className={styles.noteTitle}>내 메모 내용을 여기에 표시</p>
                        <EditorNoSSR
                            ref={editorRef}
                            getTimestamp={() => currentTimestamp}
                            onTimestampClick={(timestamp: string) => {
                                const [m, s] = timestamp.split(':').map(Number);
                                const total = (m || 0) * 60 + (s || 0);
                                playerRef.current?.seekTo(total, true);
                            }}
                            isEditable={true}
                            editingItemId={editingItemId}
                            onEditStart={(itemId: string) => setEditingItemId(itemId)}
                            onEditEnd={() => setEditingItemId(null)}
                        />
                    </>
                );
            // 후에 내용별 반영 예정
            case 'AI 요약 보기':
                return <p className={styles.noteTitle}>AI 요약 내용을 여기에 표시</p>;
            case '옵션 3':
                return <p className={styles.noteTitle}>옵션 3의 내용을 여기에 표시</p>;
            default:
                return <p className={styles.noteTitle}>기본 내용을 여기에 표시</p>;
        }
    };

    const changeVideo = (newVideoId: string) => {
        router.push(`/vemo/${newVideoId}`);
    };

    return (
        <div className={styles.container}>
            {/* (1) 유튜브 영상 섹션 */}
            <div className={styles.section1} style={{ position: 'relative' }}>
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
                        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                        title="YouTube Video Player"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
            </div>

            {/* (8) 사이드바 및 노트 영역 */}
            <div className={styles.section3}>
                <SummaryProvider>
                    <SideBarNav
                        selectedOption="내 메모 보기"
                        onOptionSelect={() => {}}
                        renderSectionContent={() => (
                            <>
                                <p className={styles.noteTitle}>내 메모 내용을 여기에 표시</p>
                                <EditorNoSSR
                                    ref={null}
                                    getTimestamp={() => '00:00'}
                                    onTimestampClick={() => {}}
                                    isEditable={true}
                                    editingItemId={null}
                                    onEditStart={() => {}}
                                    onEditEnd={() => {}}
                                    memosId={memosId!}
                                />
                            </>
                        )}
                        currentTimestamp="00:00"
                        handleCaptureTab={() => {}}
                        editorRef={editorRef}
                    />
                </SummaryProvider>
            </div>
        </div>
    );
}