'use client';

import { createMemos } from '@/app/api/memoService';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import styles from './Vemo.module.css';
import SideBarNav from './components/sideBarNav/sideBarNav';
import { SummaryProvider } from './context/SummaryContext';

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

// ----------------------------------------------------------------
// 📌 동적 로드(Dynamic Import)로 에디터 컴포넌트를 가져옴
// ----------------------------------------------------------------
const EditorNoSSR = dynamic<CustomEditorProps>(() => import('./components/editor/editor'), {
    ssr: false,
});

// ----------------------------------------------------------------
// 📌 VemoPage 컴포넌트 (주요 로직)
// ----------------------------------------------------------------
export default function VemoPage() {
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
    }, [vemo, router]);

    useEffect(() => {
        console.log('Current memosId:', memosId);
    }, [memosId]);

    return (
        <div className={styles.container}>
            {/* 유튜브 영상 섹션 */}
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
                        src={`https://www.youtube.com/embed/${vemo}?enablejsapi=1`}
                        title="YouTube Video Player"
                        frameBorder="0"
                        allowFullScreen
                    />
                </div>
            </div>

            {/* 사이드바 및 노트 영역 */}
            <div className={styles.section3}>
                <SummaryProvider>
                    <SideBarNav
                        selectedOption="내 메모 보기"
                        onOptionSelect={() => {}}
                        handleCaptureArea={() => {}}
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
