// page.tsx
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
    const playerRef = useRef<YouTubePlayer | null>(null);
    const editorRef = useRef<any>(null);
    const [currentTimestamp, setCurrentTimestamp] = useState('00:00');
    const [selectedOption, setSelectedOption] = useState('내 메모 보기');
    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [vemoData, setVemoData] = useState<CreateMemosResponseDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [memosId, setMemosId] = useState<number | null>(null);

    //  capture status tracking
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const [editingCaptureId, setEditingCaptureId] = useState<string | null>(null);
    const [editingCaptureImage, setEditingCaptureImage] = useState<string | null>(null);

    // videoId 값 확인
    console.log('page.tsx videoId:', videoId);
    // fetchVemoData 함수를 useCallback으로 상위 스코프로 이동
    // fetchVemoData 함수를 먼저 선언
    const fetchVemoData = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('토큰이 없습니다.');
                setError('로그인이 필요한 서비스입니다.');
                router.push('/login');
                return;
            }

            // URL에서 memosId와 mode 파라미터 확인
            const urlParams = new URLSearchParams(window.location.search);
            const existingMemosId = urlParams.get('memosId');
            const mode = urlParams.get('mode');

            // 기존 메모 수정 모드인 경우 getOrCreate 호출하지 않고 직접 메모 조회
            if (existingMemosId && mode === 'edit') {
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
                // 타입 변환하여 저장
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

            // 일반적인 경우 getOrCreate 호출 (퍼가기 등)
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

<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 29f9abc (feat: 그리기 이후 이미지 변경 구현)
    // 이미지 데이터 처리를 위한 함수 추가
    const processImageData = (dataUrl: string) => {
        try {
            // 이미지 데이터가 유효한지 확인
            if (!dataUrl.startsWith('data:image/')) {
                console.error('Invalid image data URL');
                return null;
            }
            return dataUrl;
        } catch (error) {
            console.error('Image processing error:', error);
            return null;
        }
    };

<<<<<<< HEAD
    // 그리기 시작 핸들러
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
            // 사용자에게 에러 메시지 표시
            alert('이미지를 불러오는데 실패했습니다. 다시 시도해주세요.');
        }
    };

=======
=======
>>>>>>> 29f9abc (feat: 그리기 이후 이미지 변경 구현)
    // 그리기 시작 핸들러
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
            // 사용자에게 에러 메시지 표시
            alert('이미지를 불러오는데 실패했습니다. 다시 시도해주세요.');
        }
    };

>>>>>>> b825c83 (fix: 그리기 배경 못불러오는 부분 & 저장 못하는 부분 수정)
    // 그리기 저장 핸들러
    const handleDrawingSave = async (editedImageUrl: string, captureId?: string) => {
        if (editorRef.current?.addCaptureItem) {
            const currentTime = currentTimestamp;
            try {
<<<<<<< HEAD
<<<<<<< HEAD
=======
>>>>>>> 29f9abc (feat: 그리기 이후 이미지 변경 구현)
                const processedImage = processImageData(editedImageUrl);
                if (!processedImage) {
                    throw new Error('Invalid image data');
                }
                
<<<<<<< HEAD
                if (captureId) {
                    await editorRef.current.addCaptureItem(currentTime, processedImage, captureId);
                } else {
                    await editorRef.current.addCaptureItem(currentTime, processedImage);
=======
=======
>>>>>>> 29f9abc (feat: 그리기 이후 이미지 변경 구현)
                if (captureId) {
                    await editorRef.current.addCaptureItem(currentTime, processedImage, captureId);
                } else {
<<<<<<< HEAD
                    // 새 캡처 생성
                    await editorRef.current.addCaptureItem(currentTime, editedImageUrl);
>>>>>>> b825c83 (fix: 그리기 배경 못불러오는 부분 & 저장 못하는 부분 수정)
=======
                    await editorRef.current.addCaptureItem(currentTime, processedImage);
>>>>>>> 29f9abc (feat: 그리기 이후 이미지 변경 구현)
                }
                setIsDrawingMode(false);
                setCapturedImage(null);
                setEditingCaptureId(null);
            } catch (error) {
                console.error('Drawing save failed:', error);
            }
        }
    };

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

            {/* DrawingCanvas 조건부 렌더링 */}
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
                />
            )}
        </div>
    );
}
