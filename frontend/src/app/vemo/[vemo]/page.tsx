// memoService
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

    // [추가됨] memosId를 넘겨주어 Editor에서 getMemos 호출 가능 or 상위에서 setSections 가능
    memosId: number;
}

// ----------------------------------------------------------------
// 📌 Page 컴포넌트에 전달될 Params
// (실제 사용 여부에 따라 제거 가능)
// ----------------------------------------------------------------
interface PageProps {
    params: {
        vemo: string;
    };
}

// ----------------------------------------------------------------
// 📌 VemoPage 컴포넌트 (주요 로직)
// ----------------------------------------------------------------
export default function VemoPage() {
    // params를 useParams()로 가져오기
    const params = useParams();
    const vemo = params.vemo as string;

    // editorRef 정의
    const editorRef = useRef(null);
    const [memosId, setMemosId] = useState<number | null>(null);
    const router = useRouter();

    useEffect(() => {
        const initializeMemos = async () => {
            console.log('test');
            if (!vemo) return;
            console.log(vemo);

            try {
                console.log('Creating memos for video:', vemo);
                const data = await createMemos(vemo);
                if (data.id) {
                    setMemosId(data.id);
                    console.log('Successfully created memos with ID:', data.id);
                }
            } catch (error: any) {
                console.error('Failed to initialize memos:', error);
                if (error?.response?.status === 401) {
                    router.push('/login');
                }
            }
        };

        initializeMemos();
    }, [vemo, router]); // router를 의존성 배열에 추가

    // memosId 상태 변경 추적
    useEffect(() => {
        console.log('Current memosId:', memosId);
    }, [memosId]);

    return (
        <div className={styles.container}>
            {/* (7) 유튜브 영상 섹션 */}
            <div className={styles.section1} style={{ position: 'relative' }}>
                {/* 홈으로 이동하는 버튼 */}
                <Link href="/" passHref>
                    <img
                        src="/icons/Button_home.svg"
                        alt="VEMO logo"
                        className={styles.logoButton}
                    />
                </Link>

                {/* 유튜브 iframe 플레이어 */}
                <div className={styles.videoWrapper}>
                    <iframe
                        id="youtube-player"
                        src={`https://www.youtube.com/embed/${vemo}?enablejsapi=1`}
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
                                {memosId && ( // memosId가 있을 때만 EditorNoSSR 렌더링
                                    <EditorNoSSR
                                        ref={editorRef} // editorRef 전달
                                        getTimestamp={() => '00:00'}
                                        onTimestampClick={() => {}}
                                        isEditable={true}
                                        editingItemId={null}
                                        onEditStart={() => {}}
                                        onEditEnd={() => {}}
                                        memosId={memosId}
                                    />
                                )}
                            </>
                        )}
                        currentTimestamp="00:00"
                        handleCaptureTab={() => {}}
                        editorRef={editorRef} // editorRef 전달
                        handleCaptureArea={() => {}}
                    />
                </SummaryProvider>
            </div>
        </div>
    );
}
