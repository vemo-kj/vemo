'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CreateMemosResponseDto } from '../../types/vemo.types';
import styles from './Vemo.module.css';
import SideBarNav from './components/sideBarNav/sideBarNav';
import DrawingCanvas from './components/DrawingCanvas/DrawingCanvas';

// 동적 로드된 DraftEditor
const EditorNoSSR = dynamic(() => import('./components/editor/editor'), {
    ssr: false,
});

interface YouTubePlayer {
    destroy: () => void;
    getCurrentTime: () => number;
    seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    pauseVideo: () => void;
}

declare global {
    interface Window {
        YT: {
            Player: new (
                elementId: string,
                config: {
                    videoId: string;
                    playerVars?: Record<string, any>;
                    events?: {
                        onReady?: (event: { target: YouTubePlayer }) => void;
                        onStateChange?: (event: { data: number }) => void;
                        onError?: (event: any) => void;
                    };
                },
            ) => YouTubePlayer;
            PlayerState: {
                PLAYING: number;
            };
        };
        onYouTubeIframeAPIReady: () => void;
    }
}

export default function VemoPage() {
    const router = useRouter();
    const params = useParams();
    const videoId = params?.vemo as string;

    // 유튜브 플레이어 Ref
    const playerRef = useRef<YouTubePlayer | null>(null);

    // Editor Ref
    const editorRef = useRef<any>(null);

    // 현재 타임스탬프
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');

    // 사이드바 드롭다운 옵션
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');

    // 에디팅 중인 아이템
    const [editingItemId, setEditingItemId] = useState<string | null>(null);

    // 서버에서 불러온 메모 데이터
    const [vemoData, setVemoData] = useState<CreateMemosResponseDto | null>(null);
    const [memosId, setMemosId] = useState<number | null>(null);

    // 로딩/에러 상태
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 유튜브 플레이어 상태
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // 그리기 모달/캡처 편집 관련 상태
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [editingCaptureId, setEditingCaptureId] = useState<string | null>(null);
    const [editingCaptureImage, setEditingCaptureImage] = useState<string | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    console.log('page.tsx videoId:', videoId);

    // ------------------ (1) 메모/캡처 불러오기 ------------------
    const fetchVemoData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                setError('로그인이 필요한 서비스입니다.');
                router.push('/login');
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const existingMemosId = urlParams.get('memosId');
            const mode = urlParams.get('mode');

            if (existingMemosId && mode === 'edit') {
                // 기존 메모 수정 모드
                const memosResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/memos/${existingMemosId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: 'include',
                    },
                );
                if (!memosResponse.ok) {
                    throw new Error('메모를 불러오는데 실패했습니다.');
                }
                const memosData = await memosResponse.json();
                setVemoData({
                    id: Number(existingMemosId),
                    title: memosData.title || '',
                    createdAt: memosData.createdAt || new Date(),
                    memo: memosData.memo || [],
                    captures: memosData.captures || [],
                });
                setMemosId(Number(existingMemosId));
                return;
            }

            // 일반적인 경우 (퍼가기 등)
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/home/memos/${videoId}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                },
            );
            if (!response.ok) {
                throw new Error(`메모 데이터를 불러오는데 실패했습니다. (${response.status})`);
            }
            const data: CreateMemosResponseDto = await response.json();
            console.log('받은 메모 데이터:', data);
            setVemoData(data);
            setMemosId(data.id);

            // 추가 메모 상세 조회
            if (data.id) {
                const memosResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/memos/${data.id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        credentials: 'include',
                    },
                );
                const memosData = await memosResponse.json();
                setVemoData(prevData => ({
                    ...prevData!,
                    memos: memosData,
                }));
            }
        } catch (error) {
            console.error('데이터 로딩 실패:', error);
            if (error instanceof Error) {
                setError(error.message);
                if (error.message.includes('로그인이 필요한 서비스입니다.')) {
                    router.push('/login');
                }
            } else {
                setError('알 수 없는 오류가 발생했습니다.');
            }
        } finally {
            setIsLoading(false);
        }
    }, [videoId, router]);

    // ------------------ (2) 유튜브 Player 초기화 ------------------
    const startTimestampUpdate = useCallback(() => {
        if (!playerRef.current?.getCurrentTime) return;
        const interval = setInterval(() => {
            if (playerRef.current?.getCurrentTime) {
                const currentTime = playerRef.current.getCurrentTime();
                const minutes = Math.floor(currentTime / 60);
                const seconds = Math.floor(currentTime % 60);
                setCurrentTimestamp(
                    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
                );
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const loadYouTubeAPI = useCallback(() => {
        return new Promise<void>(resolve => {
            if (window.YT) {
                resolve();
                return;
            }
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.id = 'youtube-api';
            window.onYouTubeIframeAPIReady = () => resolve();
            document.body.appendChild(tag);
        });
    }, []);

    const initializePlayer = useCallback(() => {
        if (!videoId || playerRef.current) return;

        try {
            playerRef.current = new window.YT.Player('youtube-player', {
                videoId,
                playerVars: {
                    enablejsapi: 1,
                    origin: window.location.origin,
                    rel: 0,
                    modestbranding: 1,
                },
                events: {
                    onReady: () => {
                        console.log('Player ready');
                        setIsPlayerReady(true);
                        startTimestampUpdate();
                        fetchVemoData();
                    },
                    onStateChange: event => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            startTimestampUpdate();
                        }
                    },
                    onError: error => {
                        console.error('Player error:', error);
                        setError('플레이어 초기화 실패');
                    },
                },
            });
        } catch (error) {
            console.error('Player initialization failed:', error);
            setError('플레이어 초기화 실패');
        }
    }, [videoId, startTimestampUpdate, fetchVemoData]);

    useEffect(() => {
        let isMounted = true;
        const initialize = async () => {
            if (!videoId || !isMounted) return;
            try {
                await loadYouTubeAPI();
                if (window.YT) {
                    initializePlayer();
                }
            } catch (error) {
                console.error('초기화 실패:', error);
                if (isMounted) {
                    setError('초기화 실패');
                }
            }
        };
        initialize();

        return () => {
            isMounted = false;
            if (playerRef.current?.destroy) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [videoId, loadYouTubeAPI, initializePlayer]);

    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    // ------------------ (3) 캡처 메시지 수신 ------------------
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.source !== window) return;
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

    const handleCaptureTab = async () => {
        if (!editorRef.current) return;
        try {
            window.postMessage({ type: 'CAPTURE_TAB' }, '*');
        } catch (error) {
            console.error('캡처 요청 실패:', error);
        }
    };

    const handleCaptureArea = async () => {
        if (!editorRef.current) return;
        try {
            window.postMessage({ type: 'CAPTURE_AREA' }, '*');
        } catch (error) {
            console.error('부분 캡처 요청 실패:', error);
        }
    };

    // ------------------ (4) 메모 저장 후 다시 불러오기 ------------------
    const handleMemoSaved = useCallback(() => {
        if (videoId) {
            fetchVemoData();
        }
    }, [videoId, fetchVemoData]);

    // ------------------ (5) 그리기 편집 ------------------
    const processImageData = (dataUrl: string) => {
        if (!dataUrl.startsWith('data:image/')) {
            console.error('Invalid image data URL');
            return null;
        }
        return dataUrl;
    };

    const handleDrawingStart = async (captureId: string) => {
        console.log('Drawing start with capture ID:', captureId);
        try {
            if (!vemoData?.captures) {
                throw new Error('No captures data available');
            }
            const capture = vemoData.captures.find(c => `capture-${c.id}` === `capture-${captureId}`);
            if (!capture?.image) {
                throw new Error('Capture image not found');
            }
            setEditingCaptureImage(capture.image);
            setEditingCaptureId(captureId);
            setIsDrawingMode(true);
        } catch (error) {
            console.error('Error starting drawing mode:', error);
            alert('이미지를 불러오는데 실패했습니다. 다시 시도해주세요.');
        }
    };

    const handleDrawingSave = async (editedImageUrl: string, captureId?: string) => {
        if (!editorRef.current?.addCaptureItem) return;
        const currentTime = currentTimestamp;
        try {
            const processed = processImageData(editedImageUrl);
            if (!processed) {
                throw new Error('Invalid image data');
            }
            if (captureId) {
                await editorRef.current.addCaptureItem(currentTime, processed, captureId);
            } else {
                await editorRef.current.addCaptureItem(currentTime, processed);
            }
            setIsDrawingMode(false);
            setCapturedImage(null);
            setEditingCaptureId(null);
        } catch (error) {
            console.error('Drawing save failed:', error);
        }
    };

    // ------------------ (에러 화면) ------------------
    if (error) {
        return (
            <div className={styles.errorContainer}>
                <h3>오류가 발생했습니다</h3>
                <p>{error}</p>
                <button onClick={() => window.location.reload()}>다시 시도</button>
            </div>
        );
    }

    // ------------------ (6) 최종 Render ------------------
    return (
        <div className={styles.container}>
            <div className={styles.section1} style={{ position: 'relative' }}>
                <Link href="/" passHref>
                    <img
                        src="/icons/Button_home.svg"
                        alt="VEMO logo"
                        className={styles.logoButton}
                    />
                </Link>
                <div className={styles.videoWrapper}>
                    <div id="youtube-player"></div>
                    {isLoading && !isPlayerReady && (
                        <div className={styles.loadingOverlay}>
                            <div className={styles.loadingSpinner}></div>
                            <p>플레이어 로딩 중...</p>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.section3}>
                <SideBarNav
                    selectedOption={selectedOption}
                    onOptionSelect={setSelectedOption}
                    vemoData={vemoData}
                    renderSectionContent={() => (
                        <EditorNoSSR
                            ref={editorRef}
                            getTimestamp={() => currentTimestamp}
                            onTimestampClick={handleSeekToTime}
                            isEditable
                            editingItemId={editingItemId}
                            onEditStart={(itemId: string) => setEditingItemId(itemId)}
                            onEditEnd={() => setEditingItemId(null)}
                            videoId={videoId}
                            onPauseVideo={() => playerRef.current?.pauseVideo()}
                            onMemoSaved={handleMemoSaved}
                            memosId={memosId}
                            vemoData={vemoData}
                            onDrawingStart={handleDrawingStart}
                        />
                    )}
                    currentTimestamp={currentTimestamp}
                    handleCaptureTab={handleCaptureTab}
                    handleCaptureArea={handleCaptureArea}
                    editorRef={editorRef}
                    videoId={videoId}
                    memosId={memosId}
                />
            </div>

            {/* DrawingCanvas (그리기) 모달 */}
            {isDrawingMode && (
                <DrawingCanvas
                    backgroundImage={editingCaptureImage || capturedImage || ''}
                    captureId={editingCaptureId || ''}
                    onSave={handleDrawingSave}
                    onClose={() => {
                        setIsDrawingMode(false);
                        setCapturedImage(null);
                        setEditingCaptureId(null);
                        setEditingCaptureImage(null);
                    }}
                    onRefetch={fetchVemoData}
                />
            )}
        </div>
    );
}