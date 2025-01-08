'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CreateMemosResponseDto } from '../../types/vemo.types';
import styles from './Vemo.module.css';
import SideBarNav from './components/sideBarNav/sideBarNav';

const EditorNoSSR = dynamic(() => import('./components/editor/editor'), {
    ssr: false,
});

export default function VemoPage() {
    const router = useRouter();
    const params = useParams();
    const videoId = params?.vemo as string | null;
    const playerRef = useRef<any>(null);
    const editorRef = useRef<any>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');
    const [isEditing, setIsEditing] = useState(false);
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    // const [videoId, setVideoId] = useState('pEt89CrE-6A');

    // 새로 추가되는 상태들
    const [vemoData, setVemoData] = useState<CreateMemosResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [memosId, setMemosId] = useState<number | null>(null);

    // Add capture status tracking
    const [captureStatus, setCaptureStatus] = useState<'idle' | 'processing'>('idle');
    const [lastCaptureError, setLastCaptureError] = useState<string | null>(null);

    // videoId 값 확인
    console.log('page.tsx videoId:', videoId);

    // fetchVemoData 함수를 useCallback으로 상위 스코프로 이동
    const fetchVemoData = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                setError('로그인이 필요한 서비스입니다.');
                router.push('/login');
                return;
            }

            const response = await fetch(`http://localhost:5050/home/memos/${videoId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            console.log(response);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('서버 응답:', {
                    status: response.status,
                    statusText: response.statusText,
                    body: errorText,
                });
                throw new Error(`메모 데이터를 불러오는데 실패했습니다. (${response.status})`);
            }

            const data: CreateMemosResponseDto = await response.json();
            console.log('받은 메모 데이터 :', data);
            setVemoData(data);
            setMemosId(data.id);
            console.log('받은 메모 데이터 i  :', data.id);
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            setError(error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    }, [videoId, router]);

    // 초기 데이터 로드를 위한 useEffect
    useEffect(() => {
        if (videoId) {
            fetchVemoData();
        }
    }, [videoId, fetchVemoData]);

    useEffect(() => {
        if (!videoId) return;

        // 기존 player가 있다면 제거
        if (playerRef.current) {
            playerRef.current.destroy();
        }

        // YouTube Iframe API 로드
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        // YouTube Player 초기화
        (window as any).onYouTubeIframeAPIReady = () => {
            playerRef.current = new (window as any).YT.Player('youtube-player', {
                videoId: videoId,
                events: {
                    onReady: () => {
                        console.log('Player ready');
                        // Player 준비되면 timestamp 업데이트 시작
                        startTimestampUpdate();
                    },
                },
            });
        };
    }, [videoId]);

    // timestamp 업데이트 함수를 별도로 분리
    const startTimestampUpdate = () => {
        const interval = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                const sec = playerRef.current.getCurrentTime();
                const mm = Math.floor(sec / 60);
                const ss = Math.floor(sec % 60);
                setCurrentTimestamp(
                    `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`,
                );
            }
        }, 1000);
        return () => clearInterval(interval);
    };

    // timestamp 업데이트 useEffect 수정
    useEffect(() => {
        if (editingItemId !== null) return;
        return startTimestampUpdate();
    }, [editingItemId]);

    // 드롭다운 선택
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // 노트 아이템에서 timestamp 버튼 클릭 → 해당 시각으로 이동
    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    // (캡처) 메시지 수신 → editorRef.current?.addCaptureItem
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.source !== window) return; // 보안상 체크

            console.log('메시지 수신:', e.data);
            if (e.data.type === 'CAPTURE_TAB_RESPONSE') {
                console.log('전체 캡처 응답 수신');
                editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
            } else if (e.data.type === 'CAPTURE_AREA_RESPONSE') {
                console.log('부분 캡처 응답 수신');
                editorRef.current?.addCaptureItem?.(currentTimestamp, e.data.dataUrl);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [currentTimestamp]);

    // 전체/부분 캡처
    const handleCaptureTab = async () => {
        if (!editorRef.current) return;

        try {
            console.log('전체 캡처 요청 전송');
            window.postMessage(
                {
                    type: 'CAPTURE_TAB',
                },
                '*',
            );
        } catch (error) {
            console.error('캡처 요청 실패:', error);
        }
    };

    const handleCaptureArea = async () => {
        if (!editorRef.current) return;

        try {
            console.log('부분 캡처 요청 전송');
            window.postMessage(
                {
                    type: 'CAPTURE_AREA',
                },
                '*',
            );
        } catch (error) {
            console.error('부분 캡처 요청 실패:', error);
        }
    };

    // 섹션 내용 렌더링
    const renderSectionContent = () => {
        switch (selectedOption) {
            case '내 메모 보기':
                return (
                    <>
                        {/* <p className={styles.noteTitle}>메모의 제목</p> */}
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
                            videoId={videoId || ''}
                            onPauseVideo={() => playerRef.current?.pauseVideo()}
                            onMemoSaved={handleMemoSaved}
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

    // 데모 저장 후 데이터 갱신을 위한 핸들러
    const handleMemoSaved = useCallback(() => {
        if (videoId) {
            fetchVemoData();
        }
    }, [videoId, fetchVemoData]);

    // 로딩 상태 UI
    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>메모 데이터를 불러오는 중...</p>
            </div>
        );
    }

    // 에러 상태 UI
    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h3>오류가 발생했습니다</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
        );
    }

    return (
        <SummaryProvider>
            <div className={styles.container}>
                <div className={styles.videoContainer}>
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
                </div>
                <div className={styles.sidebarContainer}>
                    <SideBarNav
                        selectedOption={selectedOption}
                        onOptionSelect={handleOptionSelect}
                        renderSectionContent={renderSectionContent}
                        currentTimestamp={currentTimestamp}
                        handleCaptureTab={handleCaptureTab}
                        handleCaptureArea={handleCaptureArea}
                        editorRef={editorRef}
                        vemoData={vemoData}
                        videoId={videoId || ''}
                        memosId={memosId}
                    />
                </div>
            </div>
        </SummaryProvider>
    );
}
