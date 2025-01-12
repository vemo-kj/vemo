'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CreateMemosResponseDto } from '../../types/vemo.types';
import styles from './Vemo.module.css';
import SideBarNav from './components/sideBarNav/sideBarNav';

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
    const playerRef = useRef<YouTubePlayer | null>(null);
    const editorRef = useRef<any>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [vemoData, setVemoData] = useState<CreateMemosResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [memosId, setMemosId] = useState<number | null>(null);
    const [captureStatus, setCaptureStatus] = useState<'idle' | 'processing'>('idle');
    const [lastCaptureError, setLastCaptureError] = useState<string | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    // fetchVemoData 함수를 먼저 선언
    const fetchVemoData = useCallback(async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                setError('로그인이 필요한 서비스입니다.');
                router.push('/login');
                return;
            }

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
            } else {
                setError('알 수 없는 오류가 발생했습니다.');
            }
            if (error instanceof Error && error.message.includes('로그인이 필요한 서비스입니다.')) {
                router.push('/login');
            }
        } finally {
            setIsLoading(false);
        }
    }, [videoId, router]);

    // timestamp 업데이트 함수
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

    // YouTube API 로드
    const loadYouTubeAPI = useCallback(() => {
        return new Promise<void>(resolve => {
            if (window.YT) {
                resolve();
                return;
            }

            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            tag.id = 'youtube-api';

            window.onYouTubeIframeAPIReady = () => {
                resolve();
            };

            document.body.appendChild(tag);
        });
    }, []);

    // Player 초기화
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

    // 초기화
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

    // 노트 아이템에서 timestamp 버튼 클릭 → 해당 시각으로 이동
    const handleSeekToTime = (timestamp: string) => {
        const [m, s] = timestamp.split(':').map(Number);
        const total = (m || 0) * 60 + (s || 0);
        if (playerRef.current?.seekTo) {
            playerRef.current.seekTo(total, true);
        }
    };

    // 드롭다운 선택
    const handleOptionSelect = (option: string) => {
        setSelectedOption(option);
    };

    // (캡처) 메시지 수신 → editorRef.current?.addCaptureItem
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.source !== window) return;

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

    // 메모 저장 후 데이터 갱신을 위한 핸들러
    const handleMemoSaved = useCallback(() => {
        if (videoId) {
            fetchVemoData();
        }
    }, [videoId, fetchVemoData]);

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
                    onOptionSelect={handleOptionSelect}
                    vemoData={vemoData}
                    renderSectionContent={() => (
                        <EditorNoSSR
                            ref={editorRef}
                            getTimestamp={() => currentTimestamp}
                            onTimestampClick={handleSeekToTime}
                            isEditable={true}
                            editingItemId={editingItemId}
                            onEditStart={(itemId: string) => setEditingItemId(itemId)}
                            onEditEnd={() => setEditingItemId(null)}
                            videoId={videoId}
                            onPauseVideo={() => playerRef.current?.pauseVideo()}
                            onMemoSaved={handleMemoSaved}
                            memosId={memosId}
                            vemoData={vemoData}
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
        </div>
    );
}
